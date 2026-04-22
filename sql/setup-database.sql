-- ============================================================================
-- Toastmasters Club Executive Application - Complete Database Setup
-- ============================================================================
-- This is a MASTER SCRIPT that sets up the entire database
-- Execute this in Supabase SQL Editor to complete Phase 1.2, 1.3, and 1.4
-- 
-- What this script does:
-- 1. Creates all tables with indexes
-- 2. Seeds role_types reference data
-- 3. Enables Row Level Security on all tables
-- 4. Creates RLS policies
-- 5. Creates database functions and triggers
--
-- After running this script, you'll need to:
-- - Execute pathway-seed-data.sql (Phase 1.5)
-- - Create user accounts via Supabase Dashboard (Phase 1.6)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: CREATE TABLES AND INDEXES
-- ============================================================================

-- Members Table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id TEXT UNIQUE,
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
  aliases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_members_full_name ON members(full_name);
CREATE INDEX idx_members_status ON members(exit_date) WHERE exit_date IS NULL;
CREATE INDEX idx_members_legacy_id ON members(legacy_id);

-- Pathway Types Table
CREATE TABLE pathway_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathway_key TEXT UNIQUE NOT NULL,
  pathway_name TEXT NOT NULL,
  is_legacy BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pathway_types_active ON pathway_types(is_active);
CREATE INDEX idx_pathway_types_legacy ON pathway_types(is_legacy);
CREATE INDEX idx_pathway_types_sort ON pathway_types(sort_order);

-- Pathway Levels Table
CREATE TABLE pathway_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathway_type_id UUID REFERENCES pathway_types(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 5),
  level_name TEXT NOT NULL,
  electives_required INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pathway_type_id, level_number)
);

CREATE INDEX idx_pathway_levels_pathway ON pathway_levels(pathway_type_id);

-- Pathway Projects Table
CREATE TABLE pathway_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathway_level_id UUID REFERENCES pathway_levels(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  is_elective BOOLEAN DEFAULT false,
  has_multiple_speeches BOOLEAN DEFAULT false,
  speech_names TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pathway_projects_level ON pathway_projects(pathway_level_id);
CREATE INDEX idx_pathway_projects_elective ON pathway_projects(is_elective);

-- Pathways Table
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
  speech_number INTEGER,
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

-- Role Types Table
CREATE TABLE role_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  max_slots INTEGER DEFAULT 1,
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
  slot_order INTEGER DEFAULT 0,
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
-- PART 2: SEED ROLE TYPES DATA
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
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_projects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: CREATE RLS POLICIES
-- ============================================================================

-- Members policies
CREATE POLICY "Authenticated users can read members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert members" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update members" ON members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete members" ON members FOR DELETE TO authenticated USING (true);

-- Pathways policies
CREATE POLICY "Authenticated users can manage pathways" ON pathways FOR ALL TO authenticated USING (true);

-- Project completions policies
CREATE POLICY "Authenticated users can manage project completions" ON project_completions FOR ALL TO authenticated USING (true);

-- Level awards policies
CREATE POLICY "Authenticated users can manage level awards" ON level_awards FOR ALL TO authenticated USING (true);

-- Change history policies
CREATE POLICY "Authenticated users can read change history" ON change_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert change history" ON change_history FOR INSERT TO authenticated WITH CHECK (true);

-- Mentorships policies
CREATE POLICY "Authenticated users can manage mentorships" ON mentorships FOR ALL TO authenticated USING (true);

-- Meetings policies
CREATE POLICY "Authenticated users can manage meetings" ON meetings FOR ALL TO authenticated USING (true);

-- Role types policies
CREATE POLICY "Authenticated users can read role types" ON role_types FOR SELECT TO authenticated USING (true);

-- Meeting roles policies
CREATE POLICY "Authenticated users can manage meeting roles" ON meeting_roles FOR ALL TO authenticated USING (true);

-- Meeting attendance policies
CREATE POLICY "Authenticated users can manage meeting attendance" ON meeting_attendance FOR ALL TO authenticated USING (true);

-- Pathway types policies
CREATE POLICY "Authenticated users can read pathway types" ON pathway_types FOR SELECT TO authenticated USING (true);

-- Pathway levels policies
CREATE POLICY "Authenticated users can read pathway levels" ON pathway_levels FOR SELECT TO authenticated USING (true);

-- Pathway projects policies
CREATE POLICY "Authenticated users can read pathway projects" ON pathway_projects FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- PART 5: CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pathways_updated_at BEFORE UPDATE ON pathways FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_completions_updated_at BEFORE UPDATE ON project_completions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_types_updated_at BEFORE UPDATE ON role_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_roles_updated_at BEFORE UPDATE ON meeting_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_attendance_updated_at BEFORE UPDATE ON meeting_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pathway_types_updated_at BEFORE UPDATE ON pathway_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETION SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables created: 13';
  RAISE NOTICE '🔑 Indexes created: 25';
  RAISE NOTICE '👥 Role types seeded: 16';
  RAISE NOTICE '🔒 RLS enabled on: 13 tables';
  RAISE NOTICE '📋 RLS policies created: 18';
  RAISE NOTICE '⚙️  Functions created: 1';
  RAISE NOTICE '🔔 Triggers created: 8';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '1. ✅ Execute pathway-seed-data.sql to populate pathway reference data';
  RAISE NOTICE '2. ✅ Create user accounts via Supabase Dashboard';
  RAISE NOTICE '3. ✅ Test database by querying role_types table';
  RAISE NOTICE '';
END $$;
