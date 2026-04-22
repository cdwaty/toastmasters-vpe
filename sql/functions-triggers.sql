-- ============================================================================
-- Toastmasters Club Executive Application - Functions and Triggers
-- ============================================================================
-- This script creates database functions and triggers
-- Execute this AFTER rls-policies.sql
-- ============================================================================

-- ============================================================================
-- DROP EXISTING TRIGGERS (if any)
-- ============================================================================

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
DROP TRIGGER IF EXISTS update_pathways_updated_at ON pathways;
DROP TRIGGER IF EXISTS update_project_completions_updated_at ON project_completions;
DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
DROP TRIGGER IF EXISTS update_role_types_updated_at ON role_types;
DROP TRIGGER IF EXISTS update_meeting_roles_updated_at ON meeting_roles;
DROP TRIGGER IF EXISTS update_meeting_attendance_updated_at ON meeting_attendance;
DROP TRIGGER IF EXISTS update_pathway_types_updated_at ON pathway_types;

-- ============================================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS: Apply update_updated_at_column to relevant tables
-- ============================================================================

-- Members table trigger
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Pathways table trigger
CREATE TRIGGER update_pathways_updated_at
  BEFORE UPDATE ON pathways
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Project completions table trigger
CREATE TRIGGER update_project_completions_updated_at
  BEFORE UPDATE ON project_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Meetings table trigger
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Role types table trigger
CREATE TRIGGER update_role_types_updated_at
  BEFORE UPDATE ON role_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Meeting roles table trigger
CREATE TRIGGER update_meeting_roles_updated_at
  BEFORE UPDATE ON meeting_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Meeting attendance table trigger
CREATE TRIGGER update_meeting_attendance_updated_at
  BEFORE UPDATE ON meeting_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Pathway types table trigger
CREATE TRIGGER update_pathway_types_updated_at
  BEFORE UPDATE ON pathway_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CONFIRMATION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database functions and triggers created successfully!';
  RAISE NOTICE '⚙️  Functions created: 1';
  RAISE NOTICE '🔔 Triggers created: 8';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers configured for auto-updating updated_at on:';
  RAISE NOTICE '- members';
  RAISE NOTICE '- pathways';
  RAISE NOTICE '- project_completions';
  RAISE NOTICE '- meetings';
  RAISE NOTICE '- role_types';
  RAISE NOTICE '- meeting_roles';
  RAISE NOTICE '- meeting_attendance';
  RAISE NOTICE '- pathway_types';
END $$;
