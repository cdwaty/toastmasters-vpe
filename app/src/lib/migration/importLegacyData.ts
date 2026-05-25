import { supabase } from '../supabase';
import { Result, ok, err, toError } from '../result';
import type {
  LegacyExport, LegacyMember, LegacyPathway, LegacyProjectCompletion,
  Member, Pathway,
} from '../../types';

export interface LegacyImportSummary {
  membersInserted: number;
  pathwaysInserted: number;
  projectCompletionsInserted: number;
  levelAwardsInserted: number;
  changeHistoryInserted: number;
  mentorshipsInserted: number;
  meetingsInserted: number;
  meetingRolesInserted: number;
}

export interface ImportProgress {
  step: string;
  current: number;
  total: number;
}

export type ProgressCallback = (progress: ImportProgress) => void;

const COMPLETION_BATCH = 500;
const HISTORY_BATCH = 1000;

function batched<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function flattenCompletions(
  pathwayId: string,
  legacy: LegacyPathway,
): { level: number; project_name: string; completion_date: string | null; speech_title: string | null; evaluator_name: string | null; evaluator_member_id: string | null; speech_number: number | null; pathway_id: string }[] {
  const rows: ReturnType<typeof flattenCompletions> = [];

  for (const [levelStr, projects] of Object.entries(legacy.completed)) {
    const level = Number(levelStr);
    if (!Number.isFinite(level)) continue;
    for (const [projectName, node] of Object.entries(projects) as [string, LegacyProjectCompletion][]) {
      if (node.speeches && Object.keys(node.speeches).length > 0) {
        Object.entries(node.speeches).forEach(([speechName, speech], index) => {
          const speechNumberMatch = speechName.match(/(\d+)/);
          const speechNumber = speechNumberMatch ? Number(speechNumberMatch[1]) : index + 1;
          rows.push({
            pathway_id: pathwayId,
            level,
            project_name: projectName,
            completion_date: speech.date ?? null,
            speech_title: speech.title ?? null,
            evaluator_name: speech.evaluator ?? null,
            evaluator_member_id: null,
            speech_number: speechNumber,
          });
        });
      } else {
        rows.push({
          pathway_id: pathwayId,
          level,
          project_name: projectName,
          completion_date: node.date ?? null,
          speech_title: node.title ?? null,
          evaluator_name: node.evaluator ?? null,
          evaluator_member_id: null,
          speech_number: null,
        });
      }
    }
  }
  return rows;
}

export async function importLegacyData(
  legacyExport: LegacyExport,
  onProgress?: ProgressCallback,
): Promise<Result<LegacyImportSummary>> {
  const report = (step: string, current: number, total: number) =>
    onProgress?.({ step, current, total });
  try {
    report('Fetching reference data', 0, 1);
    const { data: pathwayTypeRows, error: ptError } = await supabase
      .from('pathway_types')
      .select('id, pathway_key');
    if (ptError) throw ptError;
    const pathwayTypeByKey = new Map(
      (pathwayTypeRows ?? []).map(pt => [(pt as { pathway_key: string }).pathway_key, (pt as { id: string }).id]),
    );

    const { data: roleTypeRows, error: rtError } = await supabase
      .from('role_types')
      .select('id, role_key');
    if (rtError) throw rtError;
    const roleTypeByKey = new Map(
      (roleTypeRows ?? []).map(rt => [(rt as { role_key: string }).role_key, (rt as { id: string }).id]),
    );

    const memberInputs = legacyExport.members.map(m => ({
      legacy_id: m.id,
      full_name: m.full_name,
      email: m.email || null,
      phone: m.phone || null,
      location: m.location || null,
      member_type: m.member_type,
      club_preference: m.club_preference,
      join_date: m.join_date || null,
      exit_date: m.exit_date,
      paid_until: m.paid_until || null,
      education_award: m.education_award || null,
      aliases: m.aliases ?? [],
    }));

    const { data: insertedMembers, error: memberError } = await supabase
      .from('members')
      .insert(memberInputs)
      .select('id, legacy_id');
    if (memberError) throw memberError;

    const memberByLegacyId = new Map<string, string>();
    for (const row of (insertedMembers ?? []) as Pick<Member, 'id' | 'legacy_id'>[]) {
      if (row.legacy_id) memberByLegacyId.set(row.legacy_id, row.id);
    }

    let pathwaysInserted = 0;
    let projectCompletionsInserted = 0;
    let levelAwardsInserted = 0;
    let changeHistoryInserted = 0;
    let mentorshipsInserted = 0;

    let memberIndex = 0;
    for (const legacyMember of legacyExport.members) {
      memberIndex++;
      report('Importing pathways and history', memberIndex, legacyExport.members.length);
      const memberUuid = memberByLegacyId.get(legacyMember.id);
      if (!memberUuid) continue;

      await insertMemberPathways(
        legacyMember,
        memberUuid,
        pathwayTypeByKey,
        counts => {
          pathwaysInserted += counts.pathways;
          projectCompletionsInserted += counts.completions;
          levelAwardsInserted += counts.awards;
        },
      );

      changeHistoryInserted += await insertChangeHistory(legacyMember, memberUuid);
    }

    report('Importing mentorships', 0, 1);
    mentorshipsInserted += await insertMentorships(legacyExport.members, memberByLegacyId);

    report('Importing meetings', 0, legacyExport.meetings?.length ?? 0);
    const { meetingsInserted, meetingRolesInserted } = await insertMeetings(
      legacyExport.meetings ?? [],
      memberByLegacyId,
      roleTypeByKey,
      (current, total) => report('Importing meetings', current, total),
    );

    return ok({
      membersInserted: insertedMembers?.length ?? 0,
      pathwaysInserted,
      projectCompletionsInserted,
      levelAwardsInserted,
      changeHistoryInserted,
      mentorshipsInserted,
      meetingsInserted,
      meetingRolesInserted,
    });
  } catch (e) {
    return err(toError(e));
  }
}

async function insertMemberPathways(
  legacyMember: LegacyMember,
  memberUuid: string,
  pathwayTypeByKey: Map<string, string>,
  onProgress: (counts: { pathways: number; completions: number; awards: number }) => void,
): Promise<void> {
  for (const legacyPathway of legacyMember.pathways) {
    const pathwayTypeId = pathwayTypeByKey.get(legacyPathway.pathway_id);
    if (!pathwayTypeId) continue;

    const { data: inserted, error } = await supabase
      .from('pathways')
      .insert({
        member_id: memberUuid,
        pathway_type_id: pathwayTypeId,
        is_primary: legacyPathway.is_primary,
        current_level: legacyPathway.current_level,
      })
      .select('id')
      .single();
    if (error) throw error;
    const pathwayId = (inserted as Pick<Pathway, 'id'>).id;

    const completions = flattenCompletions(pathwayId, legacyPathway);
    for (const batch of batched(completions, COMPLETION_BATCH)) {
      const { error: completionError } = await supabase
        .from('project_completions')
        .insert(batch);
      if (completionError) throw completionError;
    }

    const awards = Object.entries(legacyPathway.level_awarded_dates).map(([levelStr, date]) => ({
      pathway_id: pathwayId,
      level: Number(levelStr),
      awarded_date: date,
    }));
    if (awards.length > 0) {
      const { error: awardError } = await supabase.from('level_awards').insert(awards);
      if (awardError) throw awardError;
    }

    onProgress({ pathways: 1, completions: completions.length, awards: awards.length });
  }
}

async function insertChangeHistory(legacyMember: LegacyMember, memberUuid: string): Promise<number> {
  const rows = legacyMember.change_history.map(h => ({
    member_id: memberUuid,
    timestamp: h.timestamp,
    label: h.label,
    old_value: h.old_value,
    new_value: h.new_value,
  }));
  let inserted = 0;
  for (const batch of batched(rows, HISTORY_BATCH)) {
    const { error } = await supabase.from('change_history').insert(batch);
    if (error) throw error;
    inserted += batch.length;
  }
  return inserted;
}

async function insertMentorships(
  legacyMembers: LegacyMember[],
  memberByLegacyId: Map<string, string>,
): Promise<number> {
  const rows: { mentor_id: string; mentee_id: string }[] = [];
  const seen = new Set<string>();
  for (const member of legacyMembers) {
    const menteeUuid = memberByLegacyId.get(member.id);
    if (!menteeUuid) continue;
    for (const mentorLegacyId of member.mentors) {
      const mentorUuid = memberByLegacyId.get(mentorLegacyId);
      if (!mentorUuid) continue;
      const key = `${mentorUuid}::${menteeUuid}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ mentor_id: mentorUuid, mentee_id: menteeUuid });
    }
  }
  if (rows.length === 0) return 0;
  const { error } = await supabase.from('mentorships').insert(rows);
  if (error) throw error;
  return rows.length;
}

async function insertMeetings(
  legacyMeetings: LegacyExport['meetings'],
  memberByLegacyId: Map<string, string>,
  roleTypeByKey: Map<string, string>,
  onProgress?: (current: number, total: number) => void,
): Promise<{ meetingsInserted: number; meetingRolesInserted: number }> {
  if (!legacyMeetings || legacyMeetings.length === 0) {
    return { meetingsInserted: 0, meetingRolesInserted: 0 };
  }

  let meetingsInserted = 0;
  let meetingRolesInserted = 0;

  let index = 0;
  for (const legacyMeeting of legacyMeetings) {
    index++;
    onProgress?.(index, legacyMeetings.length);
    const { data: inserted, error } = await supabase
      .from('meetings')
      .insert({
        meeting_date: legacyMeeting.meeting_date,
        title: legacyMeeting.title || null,
        meeting_type: legacyMeeting.meeting_type,
        status: legacyMeeting.status,
        notes: legacyMeeting.notes || null,
      })
      .select('id')
      .single();
    if (error) throw error;
    meetingsInserted++;
    const meetingId = (inserted as { id: string }).id;

    const roles: { meeting_id: string; role_type_id: string; member_id: string | null; slot_order: number }[] = [];
    for (const [roleKey, memberLegacyIds] of Object.entries(legacyMeeting.roles)) {
      const roleTypeId = roleTypeByKey.get(roleKey);
      if (!roleTypeId) continue;
      memberLegacyIds.forEach((legacyId, index) => {
        roles.push({
          meeting_id: meetingId,
          role_type_id: roleTypeId,
          member_id: memberByLegacyId.get(legacyId) ?? null,
          slot_order: index,
        });
      });
    }
    if (roles.length > 0) {
      const { error: roleError } = await supabase.from('meeting_roles').insert(roles);
      if (roleError) throw roleError;
      meetingRolesInserted += roles.length;
    }
  }

  return { meetingsInserted, meetingRolesInserted };
}
