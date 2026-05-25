import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../../test/supabaseMock';

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../supabase';
import {
  listMeetings, createMeeting, updateMeeting, deleteMeeting,
  listMeetingRoles, upsertMeetingRole, deleteMeetingRole,
  listAttendance, countAttendanceForMember, upsertAttendance,
  listMeetingSummaries,
} from './meetings';

const from = supabase.from as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listMeetings', () => {
  it('selects all ordered by meeting_date desc', async () => {
    const chain = makeChain({ data: [{ id: 'meet1' }], error: null });
    from.mockReturnValue(chain);

    const result = await listMeetings();

    expect(from).toHaveBeenCalledWith('meetings');
    expect(chain.select).toHaveBeenCalledWith('*');
    expect(chain.order).toHaveBeenCalledWith('meeting_date', { ascending: false });
    expect(result.ok).toBe(true);
  });

  it('returns err on db failure', async () => {
    from.mockReturnValue(makeChain({ data: null, error: { message: 'boom' } }));
    expect((await listMeetings()).ok).toBe(false);
  });
});

describe('createMeeting / updateMeeting / deleteMeeting', () => {
  it('createMeeting inserts and returns row', async () => {
    const chain = makeChain({ data: { id: 'meet1' }, error: null });
    from.mockReturnValue(chain);
    const result = await createMeeting({ meeting_date: '2025-01-01' });
    expect(chain.insert).toHaveBeenCalledWith({ meeting_date: '2025-01-01' });
    expect(result.ok).toBe(true);
  });

  it('updateMeeting updates by id', async () => {
    const chain = makeChain({ data: { id: 'meet1' }, error: null });
    from.mockReturnValue(chain);
    await updateMeeting('meet1', { status: 'Published' });
    expect(chain.update).toHaveBeenCalledWith({ status: 'Published' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'meet1');
  });

  it('deleteMeeting deletes by id', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);
    await deleteMeeting('meet1');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'meet1');
  });
});

describe('listMeetingRoles', () => {
  it('queries meeting_roles scoped + ordered by slot_order', async () => {
    const chain = makeChain({ data: [], error: null });
    from.mockReturnValue(chain);

    await listMeetingRoles('meet1');

    expect(from).toHaveBeenCalledWith('meeting_roles');
    expect(chain.eq).toHaveBeenCalledWith('meeting_id', 'meet1');
    expect(chain.order).toHaveBeenCalledWith('slot_order');
  });
});

describe('upsertMeetingRole / deleteMeetingRole', () => {
  it('upsertMeetingRole calls upsert with the role', async () => {
    const chain = makeChain({ data: { id: 'r1' }, error: null });
    from.mockReturnValue(chain);
    await upsertMeetingRole({ id: 'r1', meeting_id: 'm', role_type_id: 'rt', member_id: null, slot_order: 0 });
    expect(chain.upsert).toHaveBeenCalled();
  });

  it('deleteMeetingRole deletes by id', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);
    await deleteMeetingRole('r1');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'r1');
  });
});

describe('listAttendance', () => {
  it('queries meeting_attendance scoped to meeting', async () => {
    const chain = makeChain({ data: [], error: null });
    from.mockReturnValue(chain);

    await listAttendance('meet1');

    expect(from).toHaveBeenCalledWith('meeting_attendance');
    expect(chain.eq).toHaveBeenCalledWith('meeting_id', 'meet1');
  });
});

describe('countAttendanceForMember', () => {
  it('uses count: exact, head: true and filters attended=true', async () => {
    const chain = makeChain({ data: null, count: 7, error: null });
    from.mockReturnValue(chain);

    const result = await countAttendanceForMember('m1');

    expect(chain.select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(chain.eq).toHaveBeenNthCalledWith(1, 'member_id', 'm1');
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'attended', true);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe(7);
  });

  it('returns 0 when count is null', async () => {
    from.mockReturnValue(makeChain({ data: null, count: undefined, error: null }));
    const result = await countAttendanceForMember('m1');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe(0);
  });
});

describe('upsertAttendance', () => {
  it('upserts with conflict target meeting_id,member_id', async () => {
    const chain = makeChain({ data: { id: 'a1' }, error: null });
    from.mockReturnValue(chain);

    await upsertAttendance({ meeting_id: 'm', member_id: 'p', attended: true });

    expect(chain.upsert).toHaveBeenCalledWith(
      { meeting_id: 'm', member_id: 'p', attended: true },
      { onConflict: 'meeting_id,member_id' },
    );
  });
});

describe('listMeetingSummaries', () => {
  it('returns empty map for empty input without DB call', async () => {
    const result = await listMeetingSummaries([]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.size).toBe(0);
    expect(from).not.toHaveBeenCalled();
  });

  it('builds summary with toastmaster, chair, speakers, attendance counts', async () => {
    const rolesChain = makeChain({
      data: [
        { meeting_id: 'meet1', slot_order: 0, role_type: { role_key: 'toastmaster' }, member: { full_name: 'TM' } },
        { meeting_id: 'meet1', slot_order: 0, role_type: { role_key: 'chair' }, member: { full_name: 'Chair Person' } },
        { meeting_id: 'meet1', slot_order: 1, role_type: { role_key: 'speaker' }, member: { full_name: 'S2' } },
        { meeting_id: 'meet1', slot_order: 0, role_type: { role_key: 'speaker' }, member: { full_name: 'S1' } },
      ],
      error: null,
    });
    const attChain = makeChain({
      data: [
        { meeting_id: 'meet1', attended: true, notes: null },
        { meeting_id: 'meet1', attended: false, notes: 'Apology' },
        { meeting_id: 'meet1', attended: false, notes: null },
      ],
      error: null,
    });

    from.mockReturnValueOnce(rolesChain).mockReturnValueOnce(attChain);

    const result = await listMeetingSummaries(['meet1']);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const s = result.data.get('meet1');
    expect(s).toBeDefined();
    expect(s?.toastmaster).toBe('TM');
    expect(s?.chair).toBe('Chair Person');
    expect(s?.speakers).toEqual(['S1', 'S2']);
    expect(s?.attended).toBe(1);
    expect(s?.apologies).toBe(1);
    expect(s?.rolesAssigned).toBe(4);
  });

  it('returns err if roles query fails', async () => {
    from.mockReturnValueOnce(makeChain({ data: null, error: { message: 'no' } }));
    const result = await listMeetingSummaries(['meet1']);
    expect(result.ok).toBe(false);
  });
});
