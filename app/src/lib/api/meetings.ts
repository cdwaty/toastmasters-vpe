import { supabase } from '../supabase';
import { Result, ok, err, toError } from '../result';
import { APOLOGY_NOTE } from '../constants';
import { ROLE_KEYS } from '../../pages/meetings/roleGroups';
import type { Meeting, MeetingAttendance, MeetingRole } from '../../types';

export async function listMeetings(): Promise<Result<Meeting[]>> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('meeting_date', { ascending: false });
  if (error) return err(toError(error));
  return ok((data ?? []) as Meeting[]);
}

export async function createMeeting(input: Partial<Meeting>): Promise<Result<Meeting>> {
  const { data, error } = await supabase.from('meetings').insert(input).select('*').single();
  if (error) return err(toError(error));
  return ok(data as Meeting);
}

export async function updateMeeting(id: string, patch: Partial<Meeting>): Promise<Result<Meeting>> {
  const { data, error } = await supabase.from('meetings').update(patch).eq('id', id).select('*').single();
  if (error) return err(toError(error));
  return ok(data as Meeting);
}

export async function deleteMeeting(id: string): Promise<Result<void>> {
  const { error } = await supabase.from('meetings').delete().eq('id', id);
  if (error) return err(toError(error));
  return ok(undefined);
}

export async function listMeetingRoles(meetingId: string): Promise<Result<MeetingRole[]>> {
  const { data, error } = await supabase
    .from('meeting_roles')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('slot_order');
  if (error) return err(toError(error));
  return ok((data ?? []) as MeetingRole[]);
}

export async function upsertMeetingRole(role: Partial<MeetingRole>): Promise<Result<MeetingRole>> {
  const { data, error } = await supabase.from('meeting_roles').upsert(role).select('*').single();
  if (error) return err(toError(error));
  return ok(data as MeetingRole);
}

export async function deleteMeetingRole(id: string): Promise<Result<void>> {
  const { error } = await supabase.from('meeting_roles').delete().eq('id', id);
  if (error) return err(toError(error));
  return ok(undefined);
}

export async function listAttendance(meetingId: string): Promise<Result<MeetingAttendance[]>> {
  const { data, error } = await supabase
    .from('meeting_attendance')
    .select('*')
    .eq('meeting_id', meetingId);
  if (error) return err(toError(error));
  return ok((data ?? []) as MeetingAttendance[]);
}

export async function countAttendanceForMember(memberId: string): Promise<Result<number>> {
  const { count, error } = await supabase
    .from('meeting_attendance')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('attended', true);
  if (error) return err(toError(error));
  return ok(count ?? 0);
}

export interface MeetingSummary {
  toastmaster: string | null;
  chair: string | null;
  speakers: string[];
  rolesAssigned: number;
  attended: number;
  apologies: number;
}

export async function listMeetingSummaries(meetingIds: string[]): Promise<Result<Map<string, MeetingSummary>>> {
  if (meetingIds.length === 0) return ok(new Map());

  const rolesResp = await supabase
    .from('meeting_roles')
    .select('meeting_id, slot_order, role_type:role_types(role_key), member:members(full_name)')
    .in('meeting_id', meetingIds);
  if (rolesResp.error) return err(toError(rolesResp.error));

  const attResp = await supabase
    .from('meeting_attendance')
    .select('meeting_id, attended, notes')
    .in('meeting_id', meetingIds);
  if (attResp.error) return err(toError(attResp.error));

  const summaries = new Map<string, MeetingSummary>();
  for (const id of meetingIds) {
    summaries.set(id, { toastmaster: null, chair: null, speakers: [], rolesAssigned: 0, attended: 0, apologies: 0 });
  }

  type RoleRow = {
    meeting_id: string;
    slot_order: number;
    role_type: { role_key: string } | null;
    member: { full_name: string } | null;
  };
  const speakerSlots = new Map<string, { order: number; name: string }[]>();

  for (const row of (rolesResp.data ?? []) as unknown as RoleRow[]) {
    const summary = summaries.get(row.meeting_id);
    if (!summary || !row.member) continue;
    summary.rolesAssigned += 1;
    const key = row.role_type?.role_key;
    if (key === ROLE_KEYS.TOASTMASTER) summary.toastmaster = row.member.full_name;
    else if (key === ROLE_KEYS.CHAIR) summary.chair = row.member.full_name;
    else if (key === ROLE_KEYS.SPEAKER) {
      const list = speakerSlots.get(row.meeting_id) ?? [];
      list.push({ order: row.slot_order, name: row.member.full_name });
      speakerSlots.set(row.meeting_id, list);
    }
  }
  for (const [meetingId, slots] of speakerSlots) {
    const summary = summaries.get(meetingId);
    if (summary) summary.speakers = slots.sort((a, b) => a.order - b.order).map(s => s.name);
  }

  for (const row of (attResp.data ?? []) as { meeting_id: string; attended: boolean; notes: string | null }[]) {
    const summary = summaries.get(row.meeting_id);
    if (!summary) continue;
    if (row.attended) summary.attended += 1;
    else if (row.notes === APOLOGY_NOTE) summary.apologies += 1;
  }

  return ok(summaries);
}

export async function upsertAttendance(record: Partial<MeetingAttendance>): Promise<Result<MeetingAttendance>> {
  const { data, error } = await supabase
    .from('meeting_attendance')
    .upsert(record, { onConflict: 'meeting_id,member_id' })
    .select('*')
    .single();
  if (error) return err(toError(error));
  return ok(data as MeetingAttendance);
}
