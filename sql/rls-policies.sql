-- ============================================================================
-- Toastmasters Club Executive Application - Row Level Security Policies
-- ============================================================================
-- This script enables RLS and creates policies for all tables
-- Execute this AFTER database-schema.sql
-- ============================================================================

-- ============================================================================
-- DROP EXISTING POLICIES (if any)
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can read members" ON members;
DROP POLICY IF EXISTS "Authenticated users can insert members" ON members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON members;
DROP POLICY IF EXISTS "Authenticated users can manage pathways" ON pathways;
DROP POLICY IF EXISTS "Authenticated users can manage project completions" ON project_completions;
DROP POLICY IF EXISTS "Authenticated users can manage level awards" ON level_awards;
DROP POLICY IF EXISTS "Authenticated users can read change history" ON change_history;
DROP POLICY IF EXISTS "Authenticated users can insert change history" ON change_history;
DROP POLICY IF EXISTS "Authenticated users can manage mentorships" ON mentorships;
DROP POLICY IF EXISTS "Authenticated users can manage meetings" ON meetings;
DROP POLICY IF EXISTS "Authenticated users can read role types" ON role_types;
DROP POLICY IF EXISTS "Authenticated users can manage meeting roles" ON meeting_roles;
DROP POLICY IF EXISTS "Authenticated users can manage meeting attendance" ON meeting_attendance;
DROP POLICY IF EXISTS "Authenticated users can read pathway types" ON pathway_types;
DROP POLICY IF EXISTS "Authenticated users can read pathway levels" ON pathway_levels;
DROP POLICY IF EXISTS "Authenticated users can read pathway projects" ON pathway_projects;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
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
-- MEMBERS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can read members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update members"
  ON members FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete members"
  ON members FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- PATHWAYS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can manage pathways"
  ON pathways FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- PROJECT COMPLETIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can manage project completions"
  ON project_completions FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- LEVEL AWARDS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can manage level awards"
  ON level_awards FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- CHANGE HISTORY TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can read change history"
  ON change_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert change history"
  ON change_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- MENTORSHIPS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can manage mentorships"
  ON mentorships FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- MEETINGS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can manage meetings"
  ON meetings FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- ROLE TYPES TABLE POLICIES (Read-only for authenticated users)
-- ============================================================================

CREATE POLICY "Authenticated users can read role types"
  ON role_types FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- MEETING ROLES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can manage meeting roles"
  ON meeting_roles FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- MEETING ATTENDANCE TABLE POLICIES
-- ============================================================================

CREATE POLICY "Authenticated users can manage meeting attendance"
  ON meeting_attendance FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- PATHWAY TYPES TABLE POLICIES (Read-only for authenticated users)
-- ============================================================================

CREATE POLICY "Authenticated users can read pathway types"
  ON pathway_types FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- PATHWAY LEVELS TABLE POLICIES (Read-only for authenticated users)
-- ============================================================================

CREATE POLICY "Authenticated users can read pathway levels"
  ON pathway_levels FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- PATHWAY PROJECTS TABLE POLICIES (Read-only for authenticated users)
-- ============================================================================

CREATE POLICY "Authenticated users can read pathway projects"
  ON pathway_projects FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- CONFIRMATION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Row Level Security configured successfully!';
  RAISE NOTICE '🔒 RLS enabled on: 13 tables';
  RAISE NOTICE '📋 Policies created: 18';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Summary:';
  RAISE NOTICE '- All tables require authentication';
  RAISE NOTICE '- Reference tables (role_types, pathway_*) are read-only';
  RAISE NOTICE '- Change history is read + insert only';
  RAISE NOTICE '- All other tables have full CRUD access for authenticated users';
END $$;
