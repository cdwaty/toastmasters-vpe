import { describe, it, expect } from 'vitest';
import type {
  Member, Pathway, PathwayType, PathwayLevel, PathwayProject,
  ProjectCompletion, LevelAward, ChangeHistory, Mentorship,
  Meeting, MeetingRole, MeetingAttendance, RoleType,
} from '../../types';
import { buildLegacyExport } from './exportData';

const member = (over: Partial<Member>): Member => ({
  id: 'm1',
  legacy_id: 'leg-m1',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '021',
  location: 'Auckland',
  member_type: 'Internal',
  club_preference: 'Tahi',
  join_date: '2024-01-01',
  exit_date: null,
  paid_until: '2025-01-01',
  education_award: null,
  aliases: ['JD'],
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  ...over,
});

const pathway = (over: Partial<Pathway>): Pathway => ({
  id: 'p1',
  member_id: 'm1',
  pathway_type_id: 'pt1',
  is_primary: true,
  current_level: 2,
  start_date: '2024-01-01',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  ...over,
});

const pathwayType = (over: Partial<PathwayType>): PathwayType => ({
  id: 'pt1',
  pathway_key: 'visionary',
  pathway_name: 'Visionary Communication',
  is_legacy: false,
  sort_order: 1,
  is_active: true,
  ...over,
});

const pathwayLevel = (over: Partial<PathwayLevel>): PathwayLevel => ({
  id: 'pl1',
  pathway_type_id: 'pt1',
  level_number: 1,
  level_name: 'Mastering Fundamentals',
  electives_required: 0,
  ...over,
});

const pathwayProject = (over: Partial<PathwayProject>): PathwayProject => ({
  id: 'pp1',
  pathway_level_id: 'pl1',
  project_name: 'Ice Breaker',
  is_elective: false,
  has_multiple_speeches: false,
  speech_names: null,
  sort_order: 0,
  ...over,
});

const completion = (over: Partial<ProjectCompletion>): ProjectCompletion => ({
  id: 'c1',
  pathway_id: 'p1',
  level: 1,
  project_name: 'Ice Breaker',
  completion_date: '2024-02-01',
  speech_title: 'Hello world',
  evaluator_name: 'John',
  evaluator_member_id: 'm2',
  speech_number: null,
  ...over,
});

const award = (over: Partial<LevelAward>): LevelAward => ({
  id: 'la1',
  pathway_id: 'p1',
  level: 1,
  awarded_date: '2024-03-01',
  ...over,
});

const meeting = (over: Partial<Meeting>): Meeting => ({
  id: 'meet1',
  meeting_date: '2024-04-01',
  title: 'April meeting',
  meeting_type: 'Regular',
  status: 'Published',
  notes: null,
  created_at: '2024-04-01',
  updated_at: '2024-04-01',
  ...over,
});

const meetingRole = (over: Partial<MeetingRole>): MeetingRole => ({
  id: 'mr1',
  meeting_id: 'meet1',
  role_type_id: 'rt1',
  member_id: 'm1',
  slot_order: 0,
  ...over,
});

const meetingAttendance = (over: Partial<MeetingAttendance>): MeetingAttendance => ({
  id: 'ma1',
  meeting_id: 'meet1',
  member_id: 'm1',
  attended: true,
  attendance_type: 'In Person',
  notes: null,
  ...over,
});

const roleType = (over: Partial<RoleType>): RoleType => ({
  id: 'rt1',
  role_key: 'chair',
  display_name: 'Chair',
  description: null,
  sort_order: 0,
  is_active: true,
  max_slots: 1,
  ...over,
});

const baseSnapshot = (over: Record<string, unknown> = {}) => ({
  members: [member({})],
  pathways: [pathway({})],
  pathwayTypes: [pathwayType({})],
  pathwayLevels: [pathwayLevel({})],
  pathwayProjects: [pathwayProject({})],
  projectCompletions: [completion({})],
  levelAwards: [award({})],
  changeHistory: [] as ChangeHistory[],
  mentorships: [] as Mentorship[],
  meetings: [meeting({})],
  meetingRoles: [meetingRole({})],
  meetingAttendance: [meetingAttendance({})],
  roleTypes: [roleType({})],
  ...over,
});

describe('buildLegacyExport', () => {
  it('produces a legacy export with members, meetings, pathway types', () => {
    const out = buildLegacyExport(baseSnapshot());
    expect(out.version).toBe('1.1');
    expect(out.exported_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(out.members).toHaveLength(1);
    expect(out.meetings).toHaveLength(1);
    expect(out.pathway_types).toHaveLength(1);
  });

  it('uses legacy_id when present, falls back to id otherwise', () => {
    const out = buildLegacyExport(baseSnapshot({
      members: [member({ id: 'm1', legacy_id: 'leg-1' }), member({ id: 'm2', legacy_id: null, full_name: 'Bob' })],
    }));
    expect(out.members.map(m => m.id)).toEqual(['leg-1', 'm2']);
  });

  it('groups project completions by level and project_name', () => {
    const out = buildLegacyExport(baseSnapshot({
      projectCompletions: [
        completion({ id: 'c1', level: 1, project_name: 'Ice Breaker' }),
        completion({ id: 'c2', level: 2, project_name: 'Researching' }),
      ],
    }));
    const member1 = out.members[0];
    expect(member1.pathways[0].completed['1']).toHaveProperty('Ice Breaker');
    expect(member1.pathways[0].completed['2']).toHaveProperty('Researching');
  });

  it('builds a speeches map when a project has multiple speeches', () => {
    const out = buildLegacyExport(baseSnapshot({
      projectCompletions: [
        completion({ id: 'c1', speech_number: 1, speech_title: 'First' }),
        completion({ id: 'c2', speech_number: 2, speech_title: 'Second' }),
      ],
    }));
    const project = out.members[0].pathways[0].completed['1']['Ice Breaker'];
    expect(project.speeches).toBeDefined();
    expect(Object.keys(project.speeches ?? {})).toEqual(['Speech 1', 'Speech 2']);
  });

  it('emits level_awarded_dates keyed by level', () => {
    const out = buildLegacyExport(baseSnapshot({
      levelAwards: [award({ level: 1, awarded_date: '2024-03-01' }), award({ id: 'la2', level: 2, awarded_date: '2024-09-01' })],
    }));
    expect(out.members[0].pathways[0].level_awarded_dates).toEqual({ 1: '2024-03-01', 2: '2024-09-01' });
  });

  it('maps mentorship mentor/mentee to legacy member ids', () => {
    const out = buildLegacyExport(baseSnapshot({
      members: [member({ id: 'm1', legacy_id: 'leg-1' }), member({ id: 'm2', legacy_id: 'leg-2', full_name: 'Bob' })],
      mentorships: [{ id: 'ment1', mentor_id: 'm1', mentee_id: 'm2', start_date: null, end_date: null } as Mentorship],
    }));
    expect(out.members[0].mentees).toEqual(['leg-2']);
    expect(out.members[1].mentors).toEqual(['leg-1']);
  });

  it('builds meeting roles grouped by role key', () => {
    const out = buildLegacyExport(baseSnapshot({
      meetingRoles: [
        meetingRole({ id: 'r1', role_type_id: 'rt1', member_id: 'm1', slot_order: 0 }),
        meetingRole({ id: 'r2', role_type_id: 'rt2', member_id: 'm1', slot_order: 0 }),
      ],
      roleTypes: [roleType({ id: 'rt1', role_key: 'chair' }), roleType({ id: 'rt2', role_key: 'toastmaster' })],
    }));
    expect(out.meetings?.[0].roles).toEqual({ chair: ['leg-m1'], toastmaster: ['leg-m1'] });
  });

  it('sorts pathway levels and projects by their respective order fields', () => {
    const out = buildLegacyExport(baseSnapshot({
      pathwayLevels: [
        pathwayLevel({ id: 'l2', level_number: 2 }),
        pathwayLevel({ id: 'l1', level_number: 1 }),
      ],
      pathwayProjects: [
        pathwayProject({ id: 'pp2', pathway_level_id: 'l1', sort_order: 2, project_name: 'Second' }),
        pathwayProject({ id: 'pp1', pathway_level_id: 'l1', sort_order: 1, project_name: 'First' }),
      ],
    }));
    expect(out.pathway_types?.[0].levels.map(l => l.level_number)).toEqual([1, 2]);
    expect(out.pathway_types?.[0].levels[0].projects.map(p => p.project_name)).toEqual(['First', 'Second']);
  });
});
