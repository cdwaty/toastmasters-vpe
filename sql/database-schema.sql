-- ============================================================================
-- Toastmasters Club Executive Application - Database Schema
-- ============================================================================
-- This script creates all tables, indexes, and initial seed data
-- Execute this in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Members Table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id TEXT UNIQUE, -- For migration mapping
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  member_type TEXT CHECK (member_type IN ('Internal', 'External')),
  club_preference TEXT CHECK (club_preference IN ('Tahi', 'Yarning Circle', 'Both')),
  join_date DATE,
  exit_date DATE,
  paid_until DATE,
  education_award TEXT,
  aliases TEXT[], -- Array of alternative names
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_members_full_name ON members(full_name);
CREATE INDEX idx_members_status ON members(exit_date) WHERE exit_date IS NULL;
CREATE INDEX idx_members_legacy_id ON members(legacy_id);

-- Pathway Types Table (Reference Data)
CREATE TABLE pathway_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathway_key TEXT UNIQUE NOT NULL, -- e.g., 'dynamic-leadership'
  pathway_name TEXT NOT NULL, -- e.g., 'Dynamic Leadership'
  is_legacy BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pathway_types_active ON pathway_types(is_active);
CREATE INDEX idx_pathway_types_legacy ON pathway_types(is_legacy);
CREATE INDEX idx_pathway_types_sort ON pathway_types(sort_order);

-- Pathway Levels Table (Reference Data)
CREATE TABLE pathway_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathway_type_id UUID REFERENCES pathway_types(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 5),
  level_name TEXT NOT NULL, -- e.g., 'Mastering Fundamentals'
  electives_required INTEGER DEFAULT 0, -- How many elective projects required
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pathway_type_id, level_number)
);

CREATE INDEX idx_pathway_levels_pathway ON pathway_levels(pathway_type_id);

-- Pathway Projects Table (Reference Data)
CREATE TABLE pathway_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathway_level_id UUID REFERENCES pathway_levels(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  is_elective BOOLEAN DEFAULT false,
  has_multiple_speeches BOOLEAN DEFAULT false, -- True if project has Speech 1, Speech 2, etc.
  speech_names TEXT[], -- Array of speech names for multi-speech projects
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pathway_projects_level ON pathway_projects(pathway_level_id);
CREATE INDEX idx_pathway_projects_elective ON pathway_projects(is_elective);

-- Pathways Table (Member's pathway assignments)
CREATE TABLE pathways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  pathway_type_id UUID REFERENCES pathway_types(id) ON DELETE RESTRICT,
  is_primary BOOLEAN DEFAULT false,
  current_level INTEGER DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, pathway_type_id)
);

CREATE INDEX idx_pathways_member ON pathways(member_id);
CREATE INDEX idx_pathways_pathway_type ON pathways(pathway_type_id);

-- Project Completions Table
CREATE TABLE project_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathway_id UUID REFERENCES pathways(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  project_name TEXT NOT NULL,
  completion_date DATE,
  speech_title TEXT,
  evaluator_name TEXT,
  evaluator_member_id UUID REFERENCES members(id),
  speech_number INTEGER, -- For multi-speech projects (e.g., Speech 1, Speech 2)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pathway_id, level, project_name, speech_number)
);

CREATE INDEX idx_project_completions_pathway ON project_completions(pathway_id);
CREATE INDEX idx_project_completions_evaluator ON project_completions(evaluator_member_id);
CREATE INDEX idx_project_completions_date ON project_completions(completion_date);

-- Level Awards Table
CREATE TABLE level_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathway_id UUID REFERENCES pathways(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  awarded_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pathway_id, level)
);

CREATE INDEX idx_level_awards_pathway ON level_awards(pathway_id);

-- Change History Table
CREATE TABLE change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  label TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_change_history_member ON change_history(member_id);
CREATE INDEX idx_change_history_timestamp ON change_history(timestamp DESC);

-- Mentorships Table
CREATE TABLE mentorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES members(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES members(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id),
  CHECK (mentor_id != mentee_id)
);

CREATE INDEX idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_mentee ON mentorships(mentee_id);

-- Meetings Table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_date DATE NOT NULL,
  title TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('Regular', 'Special')),
  status TEXT CHECK (status IN ('Draft', 'Published')) DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_meetings_date ON meetings(meeting_date DESC);
CREATE INDEX idx_meetings_status ON meetings(status);

-- Role Types Table (Reference Data)
CREATE TABLE role_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_key TEXT UNIQUE NOT NULL, -- e.g., 'saa', 'chair', 'speaker'
  display_name TEXT NOT NULL, -- e.g., 'Sergeant at Arms', 'Toastmaster', 'Speaker'
  description TEXT,
  sort_order INTEGER DEFAULT 0, -- For ordering in UI
  is_active BOOLEAN DEFAULT true,
  max_slots INTEGER DEFAULT 1, -- How many people can fill this role (NULL = unlimited)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_role_types_active ON role_types(is_active);
CREATE INDEX idx_role_types_sort ON role_types(sort_order);

-- Meeting Roles Table
CREATE TABLE meeting_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  role_type_id UUID REFERENCES role_types(id) ON DELETE RESTRICT,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  slot_order INTEGER DEFAULT 0, -- For ordering multiple people in same role (e.g., speaker 1, 2, 3)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meeting_roles_meeting ON meeting_roles(meeting_id);
CREATE INDEX idx_meeting_roles_member ON meeting_roles(member_id);
CREATE INDEX idx_meeting_roles_type ON meeting_roles(role_type_id);

-- Meeting Attendance Table
CREATE TABLE meeting_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT true,
  attendance_type TEXT CHECK (attendance_type IN ('In Person', 'Online')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, member_id)
);

CREATE INDEX idx_meeting_attendance_meeting ON meeting_attendance(meeting_id);
CREATE INDEX idx_meeting_attendance_member ON meeting_attendance(member_id);
CREATE INDEX idx_meeting_attendance_type ON meeting_attendance(attendance_type);

-- ============================================================================
-- SEED DATA - Role Types
-- ============================================================================

INSERT INTO role_types (role_key, display_name, description, sort_order, max_slots) VALUES
  ('saa', 'Sergeant at Arms', 'Opens and closes the meeting', 1, 1),
  ('chair', 'Chair', 'Leads the business portion of the meeting', 2, 1),
  ('toastmaster', 'Toastmaster', 'Leads the meeting program', 3, 1),
  ('humour', 'Humour Master', 'Provides humor and entertainment', 4, 1),
  ('zoom', 'Zoom Master', 'Manages the virtual meeting platform', 5, 1),
  ('round_robin', 'Round Robin', 'Leads Round Robin session', 6, 1),
  ('speaker', 'Speaker', 'Delivers prepared speeches', 7, NULL),
  ('evaluator', 'Evaluator', 'Evaluates prepared speeches', 8, NULL),
  ('backup_speaker', 'Backup Speaker', 'Backup for scheduled speakers', 9, NULL),
  ('tt_master', 'Table Topics Master', 'Leads impromptu speaking session', 10, 1),
  ('tt_speaker', 'Table Topics Speaker', 'Responds to table topics', 11, NULL),
  ('tt_evaluator', 'Table Topics Evaluator', 'Evaluates table topics responses', 12, NULL),
  ('gen_eval', 'General Evaluator', 'Evaluates the entire meeting', 13, 1),
  ('grammarian', 'Grammarian', 'Tracks language usage', 14, 1),
  ('timer', 'Timer', 'Tracks speech timing', 15, 1),
  ('ah_counter', 'Ah Counter', 'Counts filler words', 16, 1);

-- ============================================================================
-- CONFIRMATION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables created: 13';
  RAISE NOTICE '🔑 Indexes created: 25';
  RAISE NOTICE '👥 Role types seeded: 16';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Execute pathway-seed-data.sql to populate pathway reference tables';
  RAISE NOTICE '2. Configure Row Level Security (RLS)';
  RAISE NOTICE '3. Create database functions and triggers';
END $$;
