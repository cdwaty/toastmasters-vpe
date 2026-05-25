import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../../test/supabaseMock';

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../supabase';
import { listMembers, createMember, updateMember, deleteMember, bulkUpdateMembers } from './members';

const from = supabase.from as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listMembers', () => {
  it('selects all from members ordered by full_name and returns data on success', async () => {
    const rows = [{ id: 'm1', full_name: 'Jane' }];
    const chain = makeChain({ data: rows, error: null });
    from.mockReturnValue(chain);

    const result = await listMembers();

    expect(from).toHaveBeenCalledWith('members');
    expect(chain.select).toHaveBeenCalledWith('*');
    expect(chain.order).toHaveBeenCalledWith('full_name');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(rows);
  });

  it('returns err on supabase error', async () => {
    from.mockReturnValue(makeChain({ data: null, error: { message: 'boom' } }));
    const result = await listMembers();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('boom');
  });

  it('returns empty array when data is null', async () => {
    from.mockReturnValue(makeChain({ data: null, error: null }));
    const result = await listMembers();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual([]);
  });
});

describe('createMember', () => {
  it('inserts the payload and returns the inserted row', async () => {
    const row = { id: 'm1', full_name: 'Jane' };
    const chain = makeChain({ data: row, error: null });
    from.mockReturnValue(chain);

    const result = await createMember({ full_name: 'Jane' });

    expect(from).toHaveBeenCalledWith('members');
    expect(chain.insert).toHaveBeenCalledWith({ full_name: 'Jane' });
    expect(chain.single).toHaveBeenCalled();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(row);
  });

  it('returns err when insert fails', async () => {
    from.mockReturnValue(makeChain({ data: null, error: { message: 'unique violation' } }));
    const result = await createMember({ full_name: 'Jane' });
    expect(result.ok).toBe(false);
  });
});

describe('updateMember', () => {
  it('updates by id and returns the updated row', async () => {
    const row = { id: 'm1', full_name: 'Jane D' };
    const chain = makeChain({ data: row, error: null });
    from.mockReturnValue(chain);

    const result = await updateMember('m1', { full_name: 'Jane D' });

    expect(chain.update).toHaveBeenCalledWith({ full_name: 'Jane D' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'm1');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(row);
  });
});

describe('deleteMember', () => {
  it('deletes by id', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);

    const result = await deleteMember('m1');

    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'm1');
    expect(result.ok).toBe(true);
  });

  it('returns err when delete fails', async () => {
    from.mockReturnValue(makeChain({ data: null, error: { message: 'fk constraint' } }));
    const result = await deleteMember('m1');
    expect(result.ok).toBe(false);
  });
});

describe('bulkUpdateMembers', () => {
  it('updates rows by id list', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);

    const result = await bulkUpdateMembers(['m1', 'm2'], { location: 'Auckland' });

    expect(chain.update).toHaveBeenCalledWith({ location: 'Auckland' });
    expect(chain.in).toHaveBeenCalledWith('id', ['m1', 'm2']);
    expect(result.ok).toBe(true);
  });
});
