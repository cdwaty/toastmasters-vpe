import { supabase } from '../supabase';
import { Result, ok, err, toError } from '../result';
import type {
  Member, Pathway, PathwayType, PathwayLevel, PathwayProject,
  ProjectCompletion, LevelAward,
  ChangeHistory, Mentorship, Meeting, MeetingRole, RoleType,
  MeetingAttendance,
  LegacyExport, LegacyMember, LegacyPathway, LegacyMeeting,
  LegacyAttendance, LegacyPathwayType,
  LegacyProjectCompletion, LegacySpeech, LegacyChangeHistory,
} from '../../types';

interface Snapshot {
  members: Member[];
  pathways: Pathway[];
  pathwayTypes: PathwayType[];
  pathwayLevels: PathwayLevel[];
  pathwayProjects: PathwayProject[];
  projectCompletions: ProjectCompletion[];
  levelAwards: LevelAward[];
  changeHistory: ChangeHistory[];
  mentorships: Mentorship[];
  meetings: Meeting[];
  meetingRoles: MeetingRole[];
  meetingAttendance: MeetingAttendance[];
  roleTypes: RoleType[];
}

async function fetchAll<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function fetchSnapshot(): Promise<Result<Snapshot>> {
  try {
    const [
      members, pathways, pathwayTypes, pathwayLevels, pathwayProjects,
      projectCompletions, levelAwards,
      changeHistory, mentorships, meetings, meetingRoles, meetingAttendance, roleTypes,
    ] = await Promise.all([
      fetchAll<Member>('members'),
      fetchAll<Pathway>('pathways'),
      fetchAll<PathwayType>('pathway_types'),
      fetchAll<PathwayLevel>('pathway_levels'),
      fetchAll<PathwayProject>('pathway_projects'),
      fetchAll<ProjectCompletion>('project_completions'),
      fetchAll<LevelAward>('level_awards'),
      fetchAll<ChangeHistory>('change_history'),
      fetchAll<Mentorship>('mentorships'),
      fetchAll<Meeting>('meetings'),
      fetchAll<MeetingRole>('meeting_roles'),
      fetchAll<MeetingAttendance>('meeting_attendance'),
      fetchAll<RoleType>('role_types'),
    ]);
    return ok({
      members, pathways, pathwayTypes, pathwayLevels, pathwayProjects,
      projectCompletions, levelAwards,
      changeHistory, mentorships, meetings, meetingRoles, meetingAttendance, roleTypes,
    });
  } catch (e) {
    return err(toError(e));
  }
}

function buildLegacyPathway(
  pathway: Pathway,
  pathwayTypeKey: string,
  completions: ProjectCompletion[],
  awards: LevelAward[],
): LegacyPathway {
  const completed: LegacyPathway['completed'] = {};
  const byLevelProject = new Map<string, ProjectCompletion[]>();

  for (const completion of completions) {
    const key = `${completion.level}::${completion.project_name}`;
    const list = byLevelProject.get(key) ?? [];
    list.push(completion);
    byLevelProject.set(key, list);
  }

  for (const [key, group] of byLevelProject) {
    const [levelStr, projectName] = key.split('::');
    completed[levelStr] = completed[levelStr] ?? {};
    const sorted = [...group].sort(
      (a, b) => (a.speech_number ?? 0) - (b.speech_number ?? 0),
    );
    const first = sorted[0];
    const node: LegacyProjectCompletion = {
      date: first.completion_date ?? undefined,
      title: first.speech_title ?? undefined,
      evaluator: first.evaluator_name ?? undefined,
      evaluator_member_id: first.evaluator_member_id ?? undefined,
    };
    if (sorted.length > 1) {
      const speeches: Record<string, LegacySpeech> = {};
      sorted.forEach((completion, index) => {
        speeches[`Speech ${completion.speech_number ?? index + 1}`] = {
          date: completion.completion_date ?? undefined,
          title: completion.speech_title ?? undefined,
          evaluator: completion.evaluator_name ?? undefined,
          evaluator_member_id: completion.evaluator_member_id ?? undefined,
        };
      });
      node.speeches = speeches;
    }
    completed[levelStr][projectName] = node;
  }

  const levelAwardedDates: LegacyPathway['level_awarded_dates'] = {};
  for (const award of awards) {
    levelAwardedDates[String(award.level)] = award.awarded_date;
  }

  return {
    pathway_id: pathwayTypeKey,
    current_level: pathway.current_level,
    is_primary: pathway.is_primary,
    completed,
    level_awarded_dates: levelAwardedDates,
  };
}

function buildLegacyMember(
  member: Member,
  snapshot: Snapshot,
  pathwayTypeKeyById: Map<string, string>,
  memberLegacyIdById: Map<string, string>,
): LegacyMember {
  const memberPathways = snapshot.pathways.filter(p => p.member_id === member.id);
  const legacyPathways = memberPathways.map(pathway => {
    const completions = snapshot.projectCompletions.filter(c => c.pathway_id === pathway.id);
    const awards = snapshot.levelAwards.filter(a => a.pathway_id === pathway.id);
    const pathwayTypeKey = pathwayTypeKeyById.get(pathway.pathway_type_id) ?? '';
    return buildLegacyPathway(pathway, pathwayTypeKey, completions, awards);
  });

  const history: LegacyChangeHistory[] = snapshot.changeHistory
    .filter(h => h.member_id === member.id)
    .map(h => ({
      timestamp: h.timestamp,
      label: h.label,
      old_value: h.old_value,
      new_value: h.new_value,
    }));

  const mentorIds = snapshot.mentorships
    .filter(m => m.mentee_id === member.id)
    .map(m => memberLegacyIdById.get(m.mentor_id) ?? m.mentor_id);
  const menteeIds = snapshot.mentorships
    .filter(m => m.mentor_id === member.id)
    .map(m => memberLegacyIdById.get(m.mentee_id) ?? m.mentee_id);

  return {
    id: member.legacy_id ?? member.id,
    full_name: member.full_name,
    email: member.email ?? '',
    phone: member.phone ?? '',
    location: member.location ?? '',
    member_type: (member.member_type ?? 'Internal'),
    club_preference: (member.club_preference ?? 'Tahi'),
    join_date: member.join_date ?? '',
    exit_date: member.exit_date,
    paid_until: member.paid_until ?? '',
    education_award: member.education_award ?? '',
    aliases: member.aliases ?? [],
    pathways: legacyPathways,
    change_history: history,
    mentors: mentorIds,
    mentees: menteeIds,
  };
}

function buildLegacyMeeting(
  meeting: Meeting,
  snapshot: Snapshot,
  roleTypeKeyById: Map<string, string>,
  memberLegacyIdById: Map<string, string>,
): LegacyMeeting {
  const roles: Record<string, string[]> = {};
  const meetingRoles = snapshot.meetingRoles
    .filter(r => r.meeting_id === meeting.id)
    .sort((a, b) => a.slot_order - b.slot_order);

  for (const role of meetingRoles) {
    const key = roleTypeKeyById.get(role.role_type_id) ?? role.role_type_id;
    roles[key] = roles[key] ?? [];
    if (role.member_id) {
      roles[key].push(memberLegacyIdById.get(role.member_id) ?? role.member_id);
    }
  }

  const attendance: LegacyAttendance[] = snapshot.meetingAttendance
    .filter(a => a.meeting_id === meeting.id)
    .map(a => ({
      member_id: memberLegacyIdById.get(a.member_id) ?? a.member_id,
      attended: a.attended,
      attendance_type: a.attendance_type,
      notes: a.notes,
    }));

  return {
    id: meeting.id,
    meeting_date: meeting.meeting_date,
    title: meeting.title ?? '',
    meeting_type: meeting.meeting_type,
    status: meeting.status,
    roles,
    attendance,
    notes: meeting.notes ?? '',
  };
}

function buildLegacyPathwayTypes(snapshot: Snapshot): LegacyPathwayType[] {
  const projectsByLevelId = new Map<string, PathwayProject[]>();
  for (const project of snapshot.pathwayProjects) {
    const list = projectsByLevelId.get(project.pathway_level_id) ?? [];
    list.push(project);
    projectsByLevelId.set(project.pathway_level_id, list);
  }

  const levelsByTypeId = new Map<string, PathwayLevel[]>();
  for (const level of snapshot.pathwayLevels) {
    const list = levelsByTypeId.get(level.pathway_type_id) ?? [];
    list.push(level);
    levelsByTypeId.set(level.pathway_type_id, list);
  }

  return snapshot.pathwayTypes.map(type => ({
    pathway_key: type.pathway_key,
    pathway_name: type.pathway_name,
    is_legacy: type.is_legacy,
    sort_order: type.sort_order,
    is_active: type.is_active,
    levels: (levelsByTypeId.get(type.id) ?? [])
      .sort((a, b) => a.level_number - b.level_number)
      .map(level => ({
        level_number: level.level_number,
        level_name: level.level_name,
        electives_required: level.electives_required,
        projects: (projectsByLevelId.get(level.id) ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(project => ({
            project_name: project.project_name,
            is_elective: project.is_elective,
            has_multiple_speeches: project.has_multiple_speeches,
            speech_names: project.speech_names,
            sort_order: project.sort_order,
          })),
      })),
  }));
}

export function buildLegacyExport(snapshot: Snapshot): LegacyExport {
  const pathwayTypeKeyById = new Map(snapshot.pathwayTypes.map(pt => [pt.id, pt.pathway_key]));
  const roleTypeKeyById = new Map(snapshot.roleTypes.map(rt => [rt.id, rt.role_key]));
  const memberLegacyIdById = new Map(
    snapshot.members.map(m => [m.id, m.legacy_id ?? m.id]),
  );

  return {
    members: snapshot.members.map(m =>
      buildLegacyMember(m, snapshot, pathwayTypeKeyById, memberLegacyIdById),
    ),
    meetings: snapshot.meetings.map(m =>
      buildLegacyMeeting(m, snapshot, roleTypeKeyById, memberLegacyIdById),
    ),
    pathway_types: buildLegacyPathwayTypes(snapshot),
    exported_at: new Date().toISOString(),
    version: '1.1',
  };
}
