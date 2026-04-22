-- ============================================================================
-- TOASTMASTERS PATHWAYS SEED DATA
-- ============================================================================
-- This file contains all 11 Toastmasters pathways (6 current + 5 legacy)
-- with complete level and project data.
--
-- CRITICAL: Uses correct column names from database schema:
-- - pathway_types: pathway_key, pathway_name, is_legacy
-- - pathway_levels: pathway_type_id, level_number, level_name, electives_required
-- - pathway_projects: pathway_level_id, project_name, is_elective, 
--                     has_multiple_speeches, speech_names
-- ============================================================================

-- Clear existing data (in reverse order due to foreign keys)
DELETE FROM pathway_projects;
DELETE FROM pathway_levels;
DELETE FROM pathway_types;

-- ============================================================================
-- PATHWAY 1: DYNAMIC LEADERSHIP
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('dynamic-leadership', 'Dynamic Leadership', false, 1);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'dynamic-leadership';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 1;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 1;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 1;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'dynamic-leadership';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Leadership Style', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 2;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Communication Style', false, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 2;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'dynamic-leadership';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Negotiate the Best Outcome', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Active Listening', true, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 4
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 5
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 6
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 7
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 8
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 9
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 10
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 11
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 12
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 13
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 14
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 15
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 16
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'dynamic-leadership';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Manage Change', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 7
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 8
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 9
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'dynamic-leadership';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Lead in Any Situation', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'High Performance Leadership', true, true, ARRAY['Speech One', 'Speech Two'], 4
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 5
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 6
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 7
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 8
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'dynamic-leadership' AND pl.level_number = 5;


-- ============================================================================
-- PATHWAY 2: ENGAGING HUMOR
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('engaging-humor', 'Engaging Humor', false, 2);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'engaging-humor';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 1;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 1;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 1;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'engaging-humor';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Know Your Sense of Humor', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 2;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Connect with Your Audience', false, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 2;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'engaging-humor';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Engage Your Audience With Humor', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Active Listening', true, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 4
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 5
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 6
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 7
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 8
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 9
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 10
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 11
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 12
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 13
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 14
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'engaging-humor';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'The Power of Humor in an Impromptu Speech', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 7
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 8
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 9
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'engaging-humor';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Deliver Your Message With Humor', false, false, NULL::text[], 1
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'High Performance Leadership', true, true, ARRAY['Speech One', 'Speech Two'], 4
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 5
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 6
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 7
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 5;

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 8
FROM pathway_levels pl
JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'engaging-humor' AND pl.level_number = 5;


-- ============================================================================
-- PATHWAY 3: MOTIVATIONAL STRATEGIES
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('motivational-strategies', 'Motivational Strategies', false, 3);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'motivational-strategies';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'motivational-strategies';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Communication Style', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Active Listening', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'motivational-strategies';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Emotional Intelligence', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 15
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'motivational-strategies';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Motivate Others', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'motivational-strategies';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Team Building', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'High Performance Leadership', true, true, ARRAY['Speech One', 'Speech Two'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'motivational-strategies' AND pl.level_number = 5;


-- ============================================================================
-- PATHWAY 4: PERSUASIVE INFLUENCE
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('persuasive-influence', 'Persuasive Influence', false, 4);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'persuasive-influence';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'persuasive-influence';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Leadership Style', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Active Listening', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'persuasive-influence';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Conflict Resolution', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 15
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'persuasive-influence';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Leading in Difficult Situations', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'persuasive-influence';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'High Performance Leadership', false, true, ARRAY['Speech One', 'Speech Two'], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'persuasive-influence' AND pl.level_number = 5;


-- ============================================================================
-- PATHWAY 5: PRESENTATION MASTERY
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('presentation-mastery', 'Presentation Mastery', false, 5);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'presentation-mastery';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'presentation-mastery';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Communication Style', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Effective Body Language', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'presentation-mastery';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Persuasive Speaking', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Active Listening', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 15
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'presentation-mastery';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Managing a Difficult Audience', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'presentation-mastery';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Prepare to Speak Professionally', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'High Performance Leadership', true, true, ARRAY['Speech One', 'Speech Two'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'presentation-mastery' AND pl.level_number = 5;

-- ============================================================================
-- PATHWAY 6: VISIONARY COMMUNICATION
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('visionary-communication', 'Visionary Communication', false, 6);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'visionary-communication';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'visionary-communication';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Leadership Style', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Understanding Your Communication Style', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'visionary-communication';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Develop a Communication Plan', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Active Listening', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 15
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 16
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'visionary-communication';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Communicate Change', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'visionary-communication';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Develop Your Vision', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'High Performance Leadership', true, true, ARRAY['Speech One', 'Speech Two'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'visionary-communication' AND pl.level_number = 5;


-- ============================================================================
-- LEGACY PATHWAYS (5 pathways)
-- ============================================================================

-- ============================================================================
-- PATHWAY 7: EFFECTIVE COACHING (LEGACY)
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('effective-coaching', 'Effective Coaching', true, 7);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'effective-coaching';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'effective-coaching';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Leadership Style', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Understanding Your Communication Style', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'effective-coaching';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Reaching Consensus', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Active Listening', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 15
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 16
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'effective-coaching';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Improvement Through Positive Coaching', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'effective-coaching';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'High Performance Leadership', false, true, ARRAY['Speech One', 'Speech Two'], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'effective-coaching' AND pl.level_number = 5;


-- ============================================================================
-- PATHWAY 8: INNOVATIVE PLANNING (LEGACY)
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('innovative-planning', 'Innovative Planning', true, 8);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'innovative-planning';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'innovative-planning';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Leadership Style', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Connect With Your Audience', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'innovative-planning';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Present a Proposal', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Active Listening', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 15
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'innovative-planning';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Manage Projects Successfully', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'innovative-planning';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'High Performance Leadership', false, true, ARRAY['Speech One', 'Speech Two'], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'innovative-planning' AND pl.level_number = 5;

-- ============================================================================
-- PATHWAY 9: LEADERSHIP DEVELOPMENT (LEGACY)
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('leadership-development', 'Leadership Development', true, 9);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'leadership-development';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'leadership-development';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Managing Time', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Understanding Your Leadership Style', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'leadership-development';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Planning and Implementing', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Active Listening', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 15
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 16
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'leadership-development';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Leading Your Team', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'leadership-development';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Manage Successful Events', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'High Performance Leadership', true, true, ARRAY['Speech One', 'Speech Two'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'leadership-development' AND pl.level_number = 5;


-- ============================================================================
-- PATHWAY 10: STRATEGIC RELATIONSHIPS (LEGACY)
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('strategic-relationships', 'Strategic Relationships', true, 10);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'strategic-relationships';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'strategic-relationships';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Leadership Style', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Active Listening', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'strategic-relationships';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Make Connections Through Networking', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'strategic-relationships';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Public Relations Strategies', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'strategic-relationships';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Leading in Your Volunteer Organization', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'High Performance Leadership', true, true, ARRAY['Speech One', 'Speech Two'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'strategic-relationships' AND pl.level_number = 5;

-- ============================================================================
-- PATHWAY 11: TEAM COLLABORATION (LEGACY)
-- ============================================================================

INSERT INTO pathway_types (pathway_key, pathway_name, is_legacy, sort_order)
VALUES ('team-collaboration', 'Team Collaboration', true, 11);

-- Level 1: Mastering Fundamentals
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 1, 'Mastering Fundamentals', 0
FROM pathway_types WHERE pathway_key = 'team-collaboration';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Ice Breaker', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Writing a Speech with Purpose', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Introduction to Vocal Variety and Body Language', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 1
UNION ALL
SELECT pl.id, 'Evaluation and Feedback', false, true, ARRAY['Speech One', 'Speech Two', 'Speech Evaluator'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 1;

-- Level 2: Learning Your Style
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 2, 'Learning Your Style', 0
FROM pathway_types WHERE pathway_key = 'team-collaboration';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Understanding Your Leadership Style', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Active Listening', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 2
UNION ALL
SELECT pl.id, 'Introduction to Toastmasters Mentoring', false, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 2;

-- Level 3: Increasing Knowledge
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 3, 'Increasing Knowledge', 2
FROM pathway_types WHERE pathway_key = 'team-collaboration';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Successful Collaboration', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Storytelling', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Connect with Your Audience', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Creating Effective Visual Aids', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Deliver Social Speeches', true, true, ARRAY['Speech One', 'Speech Two'], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Effective Body Language', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Focus on the Positive', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Inspire Your Audience', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Know Your Sense of Humor', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Make Connections Through Networking', true, false, NULL::text[], 10
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Prepare for an Interview', true, false, NULL::text[], 11
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Understanding Vocal Variety', true, false, NULL::text[], 12
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Descriptive Language', true, false, NULL::text[], 13
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Using Presentation Software', true, false, NULL::text[], 14
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3
UNION ALL
SELECT pl.id, 'Researching and Presenting', true, false, NULL::text[], 15
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 3;

-- Level 4: Building Skills
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 4, 'Building Skills', 1
FROM pathway_types WHERE pathway_key = 'team-collaboration';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Motivate Others', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Building a Social Media Presence', true, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Create a Podcast', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Online Meetings', true, false, NULL::text[], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Manage Projects Successfully', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Managing a Difficult Audience', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Public Relations Strategies', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Question-and-Answer Session', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4
UNION ALL
SELECT pl.id, 'Write a Compelling Blog', true, false, NULL::text[], 9
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 4;

-- Level 5: Demonstrating Expertise
INSERT INTO pathway_levels (pathway_type_id, level_number, level_name, electives_required)
SELECT id, 5, 'Demonstrating Expertise', 1
FROM pathway_types WHERE pathway_key = 'team-collaboration';

INSERT INTO pathway_projects (pathway_level_id, project_name, is_elective, has_multiple_speeches, speech_names, sort_order)
SELECT pl.id, 'Lead in Any Situation', false, false, NULL::text[], 1
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Reflect on Your Path', false, false, NULL::text[], 2
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Ethical Leadership', true, false, NULL::text[], 3
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'High Performance Leadership', true, true, ARRAY['Speech One', 'Speech Two'], 4
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Leading in Your Volunteer Organization', true, false, NULL::text[], 5
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Lessons Learned', true, false, NULL::text[], 6
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Moderate a Panel Discussion', true, false, NULL::text[], 7
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 5
UNION ALL
SELECT pl.id, 'Prepare to Speak Professionally', true, false, NULL::text[], 8
FROM pathway_levels pl JOIN pathway_types pt ON pl.pathway_type_id = pt.id
WHERE pt.pathway_key = 'team-collaboration' AND pl.level_number = 5;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================

-- Verification queries (optional - comment out if not needed)
-- SELECT COUNT(*) as pathway_count FROM pathway_types;
-- SELECT COUNT(*) as level_count FROM pathway_levels;
-- SELECT COUNT(*) as project_count FROM pathway_projects;



