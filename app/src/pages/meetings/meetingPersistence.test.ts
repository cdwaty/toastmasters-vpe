import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MeetingAttendance, MeetingRole } from '../../types';
import { ok, err } from '../../lib/result';

vi.mock('../../lib/api/meetings', () => ({
  upsertMeetingRole: vi.fn(),
  deleteMeetingRole: vi.fn(),
  upsertAttendance: vi.fn(),
}));

import { upsertMeetingRole, deleteMeetingRole, upsertAttendance } from '../../lib/api/meetings';
import { persistRoles, persistAttendance } from './meetingPersistence';

const upsertRoleMock = upsertMeetingRole as ReturnType<typeof vi.fn>;
const deleteRoleMock = deleteMeetingRole as ReturnType<typeof vi.fn>;
const upsertAttendanceMock = upsertAttendance as ReturnType<typeof vi.fn>;

const role = (over: Partial<MeetingRole>): MeetingRole => ({
  id: 'r1',
  meeting_id: 'meet1',
  role_type_id: 'rt1',
  member_id: null,
  slot_order: 0,
  ...over,
});

const attendance = (over: Partial<MeetingAttendance>): MeetingAttendance => ({
  id: 'a1',
  meeting_id: 'meet1',
  member_id: 'm1',
  attended: false,
  attendance_type: null,
  notes: null,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  upsertRoleMock.mockResolvedValue(ok({}));
  deleteRoleMock.mockResolvedValue(ok(undefined));
  upsertAttendanceMock.mockResolvedValue(ok({}));
});

describe('persistRoles', () => {
  it('does nothing for empty slot that had no prior role', async () => {
    const result = await persistRoles('meet1', { rt1: [null] }, []);
    expect(result).toBe(true);
    expect(upsertRoleMock).not.toHaveBeenCalled();
    expect(deleteRoleMock).not.toHaveBeenCalled();
  });

  it('deletes prior role when slot cleared', async () => {
    await persistRoles('meet1', { rt1: [null] }, [role({ id: 'r1', role_type_id: 'rt1', slot_order: 0, member_id: 'm1' })]);
    expect(deleteRoleMock).toHaveBeenCalledWith('r1');
  });

  it('inserts a new role when slot filled with no prior', async () => {
    await persistRoles('meet1', { rt1: ['m1'] }, []);
    expect(upsertRoleMock).toHaveBeenCalledWith({
      meeting_id: 'meet1',
      role_type_id: 'rt1',
      slot_order: 0,
      member_id: 'm1',
    });
  });

  it('updates existing role by id when slot has prior + new member', async () => {
    await persistRoles('meet1', { rt1: ['m2'] }, [role({ id: 'r1', role_type_id: 'rt1', slot_order: 0, member_id: 'm1' })]);
    expect(upsertRoleMock).toHaveBeenCalledWith({
      id: 'r1',
      meeting_id: 'meet1',
      role_type_id: 'rt1',
      slot_order: 0,
      member_id: 'm2',
    });
  });

  it('deletes extra prior roles when fewer slots than before', async () => {
    await persistRoles('meet1', { rt1: ['m1'] }, [
      role({ id: 'r1', role_type_id: 'rt1', slot_order: 0, member_id: 'm1' }),
      role({ id: 'r2', role_type_id: 'rt1', slot_order: 1, member_id: 'm2' }),
    ]);
    expect(deleteRoleMock).toHaveBeenCalledWith('r2');
  });

  it('returns false when delete fails', async () => {
    deleteRoleMock.mockResolvedValueOnce(err(new Error('boom')));
    const result = await persistRoles('meet1', { rt1: [null] }, [role({ id: 'r1', role_type_id: 'rt1', slot_order: 0, member_id: 'm1' })]);
    expect(result).toBe(false);
  });

  it('returns false when upsert fails', async () => {
    upsertRoleMock.mockResolvedValueOnce(err(new Error('boom')));
    const result = await persistRoles('meet1', { rt1: ['m1'] }, []);
    expect(result).toBe(false);
  });
});

describe('persistAttendance', () => {
  it('skips members with no state and no prior', async () => {
    const result = await persistAttendance('meet1', { m1: null }, []);
    expect(result).toBe(true);
    expect(upsertAttendanceMock).not.toHaveBeenCalled();
  });

  it('upserts attended=false to clear a prior record', async () => {
    await persistAttendance('meet1', { m1: null }, [attendance({ id: 'a1', member_id: 'm1', attended: true })]);
    expect(upsertAttendanceMock).toHaveBeenCalledWith({
      id: 'a1',
      meeting_id: 'meet1',
      member_id: 'm1',
      attended: false,
      attendance_type: null,
    });
  });

  it('marks attended with attendance_type In Person', async () => {
    await persistAttendance('meet1', { m1: 'attended' }, []);
    expect(upsertAttendanceMock).toHaveBeenCalledWith({
      id: undefined,
      meeting_id: 'meet1',
      member_id: 'm1',
      attended: true,
      attendance_type: 'In Person',
      notes: null,
    });
  });

  it('marks apology with notes="Apology"', async () => {
    await persistAttendance('meet1', { m1: 'apology' }, []);
    expect(upsertAttendanceMock).toHaveBeenCalledWith({
      id: undefined,
      meeting_id: 'meet1',
      member_id: 'm1',
      attended: false,
      attendance_type: null,
      notes: 'Apology',
    });
  });

  it('returns false if upsert fails', async () => {
    upsertAttendanceMock.mockResolvedValueOnce(err(new Error('boom')));
    const result = await persistAttendance('meet1', { m1: 'attended' }, []);
    expect(result).toBe(false);
  });
});
