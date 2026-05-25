import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../../test/supabaseMock';

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() },
}));
vi.mock('../logger', () => ({
  log: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), setUser: vi.fn() },
}));

import { supabase } from '../supabase';
import { listMemberHistory, recordMemberHistory } from './changeHistory';

const from = supabase.from as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listMemberHistory', () => {
  it('queries change_history scoped to member, ordered desc, limit 100', async () => {
    const rows = [{ id: 'h1' }];
    const chain = makeChain({ data: rows, error: null });
    from.mockReturnValue(chain);

    const result = await listMemberHistory('m1');

    expect(from).toHaveBeenCalledWith('change_history');
    expect(chain.eq).toHaveBeenCalledWith('member_id', 'm1');
    expect(chain.order).toHaveBeenCalledWith('timestamp', { ascending: false });
    expect(chain.limit).toHaveBeenCalledWith(100);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(rows);
  });

  it('returns err on db failure', async () => {
    from.mockReturnValue(makeChain({ data: null, error: { message: 'boom' } }));
    const result = await listMemberHistory('m1');
    expect(result.ok).toBe(false);
  });
});

describe('recordMemberHistory', () => {
  it('returns ok with no DB call when entries is empty', async () => {
    const result = await recordMemberHistory('m1', []);
    expect(result.ok).toBe(true);
    expect(from).not.toHaveBeenCalled();
  });

  it('inserts one row per entry with member_id attached', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);

    const entries = [
      { label: 'Phone', old_value: '021', new_value: '022' },
      { label: 'Location', old_value: null, new_value: 'Auckland' },
    ];
    const result = await recordMemberHistory('m1', entries);

    expect(from).toHaveBeenCalledWith('change_history');
    expect(chain.insert).toHaveBeenCalledWith([
      { member_id: 'm1', label: 'Phone', old_value: '021', new_value: '022' },
      { member_id: 'm1', label: 'Location', old_value: null, new_value: 'Auckland' },
    ]);
    expect(result.ok).toBe(true);
  });

  it('returns err and logs on insert failure', async () => {
    from.mockReturnValue(makeChain({ data: null, error: { message: 'denied' } }));
    const result = await recordMemberHistory('m1', [
      { label: 'Phone', old_value: '021', new_value: '022' },
    ]);
    expect(result.ok).toBe(false);
    const { log } = await import('../logger');
    expect(log.warn).toHaveBeenCalled();
  });
});
