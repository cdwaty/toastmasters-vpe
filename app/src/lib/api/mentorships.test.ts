import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../../test/supabaseMock';

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../supabase';
import {
  listMentorshipsForMember, createMentorship, updateMentorship, deleteMentorship,
} from './mentorships';

const from = supabase.from as ReturnType<typeof vi.fn>;
const VALID_UUID = '11111111-2222-3333-4444-555555555555';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listMentorshipsForMember', () => {
  it('rejects an invalid uuid before any DB call', async () => {
    const result = await listMentorshipsForMember('not-a-uuid');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toMatch(/Invalid memberId/);
    expect(from).not.toHaveBeenCalled();
  });

  it('rejects empty string', async () => {
    const result = await listMentorshipsForMember('');
    expect(result.ok).toBe(false);
    expect(from).not.toHaveBeenCalled();
  });

  it('rejects sql-like injection attempt', async () => {
    const result = await listMentorshipsForMember(`${VALID_UUID},mentor_id.eq.x`);
    expect(result.ok).toBe(false);
    expect(from).not.toHaveBeenCalled();
  });

  it('queries with .or(mentor_id eq OR mentee_id eq) for a valid uuid', async () => {
    const rows = [{ id: 'ment1' }];
    const chain = makeChain({ data: rows, error: null });
    from.mockReturnValue(chain);

    const result = await listMentorshipsForMember(VALID_UUID);

    expect(from).toHaveBeenCalledWith('mentorships');
    expect(chain.or).toHaveBeenCalledWith(`mentor_id.eq.${VALID_UUID},mentee_id.eq.${VALID_UUID}`);
    expect(chain.order).toHaveBeenCalledWith('start_date', { ascending: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(rows);
  });

  it('propagates db error', async () => {
    from.mockReturnValue(makeChain({ data: null, error: { message: 'rls denied' } }));
    const result = await listMentorshipsForMember(VALID_UUID);
    expect(result.ok).toBe(false);
  });
});

describe('createMentorship', () => {
  it('inserts and returns the new row', async () => {
    const row = { id: 'ment1', mentor_id: 'a', mentee_id: 'b' };
    const chain = makeChain({ data: row, error: null });
    from.mockReturnValue(chain);

    const result = await createMentorship({ mentor_id: 'a', mentee_id: 'b' });

    expect(chain.insert).toHaveBeenCalledWith({ mentor_id: 'a', mentee_id: 'b' });
    expect(result.ok).toBe(true);
  });
});

describe('updateMentorship', () => {
  it('updates by id', async () => {
    const chain = makeChain({ data: { id: 'ment1' }, error: null });
    from.mockReturnValue(chain);

    await updateMentorship('ment1', { end_date: '2025-01-01' });

    expect(chain.update).toHaveBeenCalledWith({ end_date: '2025-01-01' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'ment1');
  });
});

describe('deleteMentorship', () => {
  it('deletes by id', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);

    await deleteMentorship('ment1');

    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'ment1');
  });
});
