import type { Member, MeetingAttendance, MeetingRole, RoleType } from '../../types';
import { APOLOGY_NOTE } from '../../lib/constants';

export type AttendanceState = 'attended' | 'apology' | null;
export type RoleSlots = Record<string, (string | null)[]>;
export type AttendanceMap = Record<string, AttendanceState>;

function initialSlotsForRole(roleType: RoleType): (string | null)[] {
  const max = roleType.max_slots ?? 1;
  return Array(Math.max(1, max)).fill(null);
}

export function buildInitialSlots(roleTypes: RoleType[], existing: MeetingRole[]): RoleSlots {
  const slots: RoleSlots = {};
  for (const roleType of roleTypes) {
    const matched = existing
      .filter(r => r.role_type_id === roleType.id)
      .sort((a, b) => a.slot_order - b.slot_order);
    if (matched.length === 0) {
      slots[roleType.id] = initialSlotsForRole(roleType);
    } else {
      slots[roleType.id] = matched.map(r => r.member_id);
    }
  }
  return slots;
}

export function buildInitialAttendance(members: Member[], existing: MeetingAttendance[]): AttendanceMap {
  const byMember = new Map(existing.map(a => [a.member_id, a]));
  const map: AttendanceMap = {};
  for (const m of members) {
    map[m.id] = priorStateFor(byMember.get(m.id));
  }
  return map;
}

export function priorStateFor(record: MeetingAttendance | undefined): AttendanceState {
  if (!record) return null;
  if (record.attended) return 'attended';
  if (record.notes === APOLOGY_NOTE) return 'apology';
  return null;
}

export function computeRolesDirty(roleSlots: RoleSlots, originalRoles: MeetingRole[]): boolean {
  const originalByRoleType = new Map<string, MeetingRole[]>();
  for (const role of originalRoles) {
    const list = originalByRoleType.get(role.role_type_id) ?? [];
    list.push(role);
    originalByRoleType.set(role.role_type_id, list);
  }
  for (const [roleTypeId, memberIds] of Object.entries(roleSlots)) {
    const priors = (originalByRoleType.get(roleTypeId) ?? [])
      .sort((a, b) => a.slot_order - b.slot_order);
    const filled = memberIds.filter(Boolean);
    if (filled.length !== priors.length) return true;
    for (let i = 0; i < filled.length; i++) {
      if (filled[i] !== priors[i]?.member_id) return true;
    }
  }
  return false;
}

export function computeAttendanceDirty(
  attendance: AttendanceMap,
  originalAttendance: MeetingAttendance[],
): boolean {
  const byMember = new Map(originalAttendance.map(a => [a.member_id, a]));
  const memberIds = new Set<string>([
    ...Object.keys(attendance),
    ...originalAttendance.map(a => a.member_id),
  ]);
  for (const memberId of memberIds) {
    const current = attendance[memberId] ?? null;
    const prior = priorStateFor(byMember.get(memberId));
    if (current !== prior) return true;
  }
  return false;
}
