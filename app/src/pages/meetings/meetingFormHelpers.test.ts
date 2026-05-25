import { describe, it, expect } from 'vitest';
import type { Member, MeetingAttendance, MeetingRole, RoleType } from '../../types';
import {
  buildInitialSlots,
  buildInitialAttendance,
  priorStateFor,
  computeRolesDirty,
  computeAttendanceDirty,
} from './meetingFormHelpers';

const makeRoleType = (id: string, maxSlots: number | null = 1): RoleType => ({
  id,
  role_key: id,
  display_name: id,
  description: null,
  sort_order: 0,
  is_active: true,
  max_slots: maxSlots,
});

const makeMember = (id: string): Member => ({
  id,
  legacy_id: null,
  full_name: id,
  email: null,
  phone: null,
  location: null,
  member_type: null,
  club_preference: null,
  join_date: null,
  exit_date: null,
  paid_until: null,
  education_award: null,
  aliases: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
});

const makeRole = (over: Partial<MeetingRole>): MeetingRole => ({
  id: 'r1',
  meeting_id: 'meet1',
  role_type_id: 'chair',
  member_id: null,
  slot_order: 0,
  ...over,
});

const makeAttendance = (over: Partial<MeetingAttendance>): MeetingAttendance => ({
  id: 'a1',
  meeting_id: 'meet1',
  member_id: 'm1',
  attended: false,
  attendance_type: null,
  notes: null,
  ...over,
});

describe('buildInitialSlots', () => {
  it('fills empty slots for role types with no existing role', () => {
    const slots = buildInitialSlots([makeRoleType('chair', 1), makeRoleType('speaker', 3)], []);
    expect(slots.chair).toEqual([null]);
    expect(slots.speaker).toEqual([null, null, null]);
  });

  it('uses existing roles when present, sorted by slot_order', () => {
    const existing = [
      makeRole({ id: 'r2', role_type_id: 'speaker', member_id: 'm2', slot_order: 1 }),
      makeRole({ id: 'r1', role_type_id: 'speaker', member_id: 'm1', slot_order: 0 }),
    ];
    const slots = buildInitialSlots([makeRoleType('speaker', 3)], existing);
    expect(slots.speaker).toEqual(['m1', 'm2']);
  });

  it('treats max_slots of 0 or null as 1', () => {
    const slots = buildInitialSlots([makeRoleType('chair', 0), makeRoleType('saa', null)], []);
    expect(slots.chair).toEqual([null]);
    expect(slots.saa).toEqual([null]);
  });
});

describe('priorStateFor', () => {
  it('returns null for undefined record', () => {
    expect(priorStateFor(undefined)).toBeNull();
  });

  it('returns attended when attended is true', () => {
    expect(priorStateFor(makeAttendance({ attended: true }))).toBe('attended');
  });

  it('returns apology when notes === "Apology"', () => {
    expect(priorStateFor(makeAttendance({ notes: 'Apology' }))).toBe('apology');
  });

  it('returns null otherwise', () => {
    expect(priorStateFor(makeAttendance({ notes: 'random' }))).toBeNull();
  });
});

describe('buildInitialAttendance', () => {
  it('maps every member, defaulting to null', () => {
    const map = buildInitialAttendance([makeMember('m1'), makeMember('m2')], []);
    expect(map).toEqual({ m1: null, m2: null });
  });

  it('reflects prior attended/apology', () => {
    const map = buildInitialAttendance(
      [makeMember('m1'), makeMember('m2'), makeMember('m3')],
      [
        makeAttendance({ member_id: 'm1', attended: true }),
        makeAttendance({ member_id: 'm2', notes: 'Apology' }),
      ],
    );
    expect(map).toEqual({ m1: 'attended', m2: 'apology', m3: null });
  });
});

describe('computeRolesDirty', () => {
  const speaker = makeRoleType('speaker', 3);

  it('returns false when slots match original', () => {
    const original = [
      makeRole({ role_type_id: 'speaker', slot_order: 0, member_id: 'm1' }),
      makeRole({ role_type_id: 'speaker', slot_order: 1, member_id: 'm2' }),
    ];
    expect(computeRolesDirty({ [speaker.id]: ['m1', 'm2', null] }, original)).toBe(false);
  });

  it('returns true when a slot was added', () => {
    const original = [makeRole({ role_type_id: 'speaker', slot_order: 0, member_id: 'm1' })];
    expect(computeRolesDirty({ [speaker.id]: ['m1', 'm2'] }, original)).toBe(true);
  });

  it('returns true when a slot was changed', () => {
    const original = [makeRole({ role_type_id: 'speaker', slot_order: 0, member_id: 'm1' })];
    expect(computeRolesDirty({ [speaker.id]: ['m2'] }, original)).toBe(true);
  });
});

describe('computeAttendanceDirty', () => {
  it('returns false when nothing changed', () => {
    const original = [makeAttendance({ member_id: 'm1', attended: true })];
    expect(computeAttendanceDirty({ m1: 'attended' }, original)).toBe(false);
  });

  it('returns true when a member toggled', () => {
    const original = [makeAttendance({ member_id: 'm1', attended: true })];
    expect(computeAttendanceDirty({ m1: 'apology' }, original)).toBe(true);
  });

  it('returns true when a member was added', () => {
    expect(computeAttendanceDirty({ m1: 'attended' }, [])).toBe(true);
  });

  it('returns true when a previously-recorded member is missing from current map', () => {
    const original = [makeAttendance({ member_id: 'm1', attended: true })];
    expect(computeAttendanceDirty({}, original)).toBe(true);
  });
});
