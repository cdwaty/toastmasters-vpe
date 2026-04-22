-- ============================================================================
-- Toastmasters Club Executive Application - Verify Reference Data
-- ============================================================================
-- This script verifies that all reference tables are populated correctly
-- Run this to check if seeding was successful
-- ============================================================================

-- ============================================================================
-- VERIFY ROLE TYPES (should have 16 roles)
-- ============================================================================

SELECT 
  'role_types' as table_name,
  COUNT(*) as total_count,
  CASE 
    WHEN COUNT(*) = 16 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 16 roles'
  END as status
FROM role_types;

-- Show all role types
SELECT id, role_key, display_name, sort_order, is_active
FROM role_types
ORDER BY sort_order;

-- ============================================================================
-- VERIFY PATHWAY TYPES (should have 11 pathways)
-- ============================================================================

SELECT 
  'pathway_types' as table_name,
  COUNT(*) as total_count,
  CASE 
    WHEN COUNT(*) = 11 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 11 pathways'
  END as status
FROM pathway_types;

-- Show all pathway types
SELECT id, pathway_key, pathway_name, is_legacy
FROM pathway_types
ORDER BY is_legacy, pathway_name;

-- ============================================================================
-- VERIFY PATHWAY LEVELS (should have 55 levels: 11 pathways × 5 levels)
-- ============================================================================

SELECT 
  'pathway_levels' as table_name,
  COUNT(*) as total_count,
  CASE 
    WHEN COUNT(*) = 55 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 55 levels (11 pathways × 5 levels)'
  END as status
FROM pathway_levels;

-- Show level counts per pathway
SELECT 
  pt.pathway_name,
  COUNT(pl.id) as level_count
FROM pathway_types pt
LEFT JOIN pathway_levels pl ON pt.id = pl.pathway_type_id
GROUP BY pt.id, pt.pathway_name
ORDER BY pt.is_legacy, pt.pathway_name;

-- ============================================================================
-- VERIFY PATHWAY PROJECTS (should have multiple projects)
-- ============================================================================

SELECT 
  'pathway_projects' as table_name,
  COUNT(*) as total_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL - No projects found'
  END as status
FROM pathway_projects;

-- Show project counts per pathway
SELECT 
  pt.pathway_name,
  COUNT(pp.id) as project_count
FROM pathway_types pt
LEFT JOIN pathway_levels pl ON pt.id = pl.pathway_type_id
LEFT JOIN pathway_projects pp ON pl.id = pp.pathway_level_id
GROUP BY pt.id, pt.pathway_name
ORDER BY pt.is_legacy, pt.pathway_name;

-- ============================================================================
-- DETAILED VERIFICATION: Sample projects from each pathway
-- ============================================================================

SELECT 
  pt.pathway_name,
  pl.level_number,
  pl.level_name,
  pp.project_name,
  pp.is_elective,
  pp.has_multiple_speeches,
  pp.speech_names
FROM pathway_types pt
JOIN pathway_levels pl ON pt.id = pl.pathway_type_id
JOIN pathway_projects pp ON pl.id = pp.pathway_level_id
WHERE pl.level_number = 1  -- Show Level 1 projects from each pathway
ORDER BY pt.pathway_name, pp.project_name;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  'VERIFICATION SUMMARY' as section,
  (SELECT COUNT(*) FROM role_types) as role_types_count,
  16 as role_types_expected,
  (SELECT COUNT(*) FROM pathway_types) as pathway_types_count,
  11 as pathway_types_expected,
  (SELECT COUNT(*) FROM pathway_levels) as pathway_levels_count,
  55 as pathway_levels_expected,
  (SELECT COUNT(*) FROM pathway_projects) as pathway_projects_count,
  '200+' as pathway_projects_expected,
  CASE 
    WHEN (SELECT COUNT(*) FROM role_types) = 16 
      AND (SELECT COUNT(*) FROM pathway_types) = 11 
      AND (SELECT COUNT(*) FROM pathway_levels) = 55 
      AND (SELECT COUNT(*) FROM pathway_projects) > 0 
    THEN '✅ ALL VERIFIED'
    ELSE '❌ VERIFICATION FAILED'
  END as overall_status;
