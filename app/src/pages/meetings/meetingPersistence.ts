import { deleteMeetingRole, upsertAttendance, upsertMeetingRole } from '../../lib/api/meetings';
import type { MeetingAttendance, MeetingRole } from '../../types';
import { APOLOGY_NOTE } from '../../lib/constants';
import type { AttendanceMap, RoleSlots } from './meetingFormHelpers';

export async function persistRoles(
  meetingId: string,
  roleSlots: RoleSlots,
  originalRoles: MeetingRole[],
): Promise<boolean> {
  const originalByRoleType = new Map<string, MeetingRole[]>();
  for (const role of originalRoles) {
    const list = originalByRoleType.get(role.role_type_id) ?? [];
    list.push(role);
    originalByRoleType.set(role.role_type_id, list);
  }

  for (const [roleTypeId, memberIds] of Object.entries(roleSlots)) {
    const existingForRole = (originalByRoleType.get(roleTypeId) ?? [])
      .sort((a, b) => a.slot_order - b.slot_order);

    for (let i = 0; i < memberIds.length; i++) {
      const memberId = memberIds[i];
      const prior = existingForRole[i];
      if (!memberId && !prior) continue;
      if (!memberId && prior) {
        const del = await deleteMeetingRole(prior.id);
        if (!del.ok) return false;
        continue;
      }
      const result = await upsertMeetingRole({
        ...(prior ? { id: prior.id } : {}),
        meeting_id: meetingId,
        role_type_id: roleTypeId,
        slot_order: i,
        member_id: memberId,
      });
      if (!result.ok) return false;
    }

    for (let i = memberIds.length; i < existingForRole.length; i++) {
      const del = await deleteMeetingRole(existingForRole[i].id);
      if (!del.ok) return false;
    }
  }
  return true;
}

export async function persistAttendance(
  meetingId: string,
  attendanceMap: AttendanceMap,
  originalAttendance: MeetingAttendance[],
): Promise<boolean> {
  const byMember = new Map(originalAttendance.map(a => [a.member_id, a]));
  for (const [memberId, state] of Object.entries(attendanceMap)) {
    const prior = byMember.get(memberId);
    if (!state && !prior) continue;
    if (!state) {
      const result = await upsertAttendance({
        id: prior?.id,
        meeting_id: meetingId,
        member_id: memberId,
        attended: false,
        attendance_type: null,
      });
      if (!result.ok) return false;
      continue;
    }
    const result = await upsertAttendance({
      id: prior?.id,
      meeting_id: meetingId,
      member_id: memberId,
      attended: state === 'attended',
      attendance_type: state === 'attended' ? 'In Person' : null,
      notes: state === 'apology' ? APOLOGY_NOTE : null,
    });
    if (!result.ok) return false;
  }
  return true;
}
