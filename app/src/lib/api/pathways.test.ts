import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../../test/supabaseMock';

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '../supabase';
import {
  listAllPathways, listPathwaysForMember, createPathway, updatePathway, deletePathway,
  listProjectCompletions, listProjectCompletionsForPathways,
  upsertProjectCompletion, deleteProjectCompletion,
  listLevelAwards, listLevelAwardsForPathways,
  setLevelAwardDate, deleteLevelAward,
} from './pathways';

const from = supabase.from as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listAllPathways', () => {
  it('orders by is_primary desc', async () => {
    const chain = makeChain({ data: [], error: null });
    from.mockReturnValue(chain);
    await listAllPathways();
    expect(from).toHaveBeenCalledWith('pathways');
    expect(chain.order).toHaveBeenCalledWith('is_primary', { ascending: false });
  });
});

describe('listPathwaysForMember', () => {
  it('filters by member_id', async () => {
    const chain = makeChain({ data: [], error: null });
    from.mockReturnValue(chain);
    await listPathwaysForMember('m1');
    expect(chain.eq).toHaveBeenCalledWith('member_id', 'm1');
  });
});

describe('createPathway / updatePathway / deletePathway', () => {
  it('createPathway inserts', async () => {
    const chain = makeChain({ data: { id: 'p1' }, error: null });
    from.mockReturnValue(chain);
    await createPathway({ member_id: 'm1', pathway_type_id: 'pt1' });
    expect(chain.insert).toHaveBeenCalledWith({ member_id: 'm1', pathway_type_id: 'pt1' });
  });

  it('updatePathway updates by id', async () => {
    const chain = makeChain({ data: { id: 'p1' }, error: null });
    from.mockReturnValue(chain);
    await updatePathway('p1', { is_primary: true });
    expect(chain.update).toHaveBeenCalledWith({ is_primary: true });
    expect(chain.eq).toHaveBeenCalledWith('id', 'p1');
  });

  it('deletePathway deletes by id', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);
    await deletePathway('p1');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'p1');
  });
});

describe('listProjectCompletions / listProjectCompletionsForPathways', () => {
  it('listProjectCompletions filters by pathway_id', async () => {
    const chain = makeChain({ data: [], error: null });
    from.mockReturnValue(chain);
    await listProjectCompletions('p1');
    expect(from).toHaveBeenCalledWith('project_completions');
    expect(chain.eq).toHaveBeenCalledWith('pathway_id', 'p1');
  });

  it('listProjectCompletionsForPathways returns empty without DB call for empty input', async () => {
    const result = await listProjectCompletionsForPathways([]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });

  it('listProjectCompletionsForPathways uses .in()', async () => {
    const chain = makeChain({ data: [], error: null });
    from.mockReturnValue(chain);
    await listProjectCompletionsForPathways(['p1', 'p2']);
    expect(chain.in).toHaveBeenCalledWith('pathway_id', ['p1', 'p2']);
  });
});

describe('upsertProjectCompletion', () => {
  it('updates when id is present', async () => {
    const chain = makeChain({ data: { id: 'c1' }, error: null });
    from.mockReturnValue(chain);
    await upsertProjectCompletion({ id: 'c1', speech_title: 'New' });
    expect(chain.update).toHaveBeenCalledWith({ speech_title: 'New' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'c1');
  });

  it('inserts when id is absent', async () => {
    const chain = makeChain({ data: { id: 'c2' }, error: null });
    from.mockReturnValue(chain);
    await upsertProjectCompletion({ pathway_id: 'p1', level: 1, project_name: 'Ice' });
    expect(chain.insert).toHaveBeenCalledWith({ pathway_id: 'p1', level: 1, project_name: 'Ice' });
  });
});

describe('deleteProjectCompletion', () => {
  it('deletes by id', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);
    await deleteProjectCompletion('c1');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'c1');
  });
});

describe('listLevelAwards / listLevelAwardsForPathways', () => {
  it('listLevelAwards filters by pathway_id', async () => {
    const chain = makeChain({ data: [], error: null });
    from.mockReturnValue(chain);
    await listLevelAwards('p1');
    expect(from).toHaveBeenCalledWith('level_awards');
    expect(chain.eq).toHaveBeenCalledWith('pathway_id', 'p1');
  });

  it('listLevelAwardsForPathways short-circuits empty', async () => {
    const result = await listLevelAwardsForPathways([]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });
});

describe('setLevelAwardDate', () => {
  it('updates existing award when found', async () => {
    const findChain = makeChain({ data: { id: 'la1' }, error: null });
    const updateChain = makeChain({ data: { id: 'la1', awarded_date: '2025-01-01' }, error: null });
    from.mockReturnValueOnce(findChain).mockReturnValueOnce(updateChain);

    const result = await setLevelAwardDate('p1', 1, '2025-01-01');
    expect(findChain.maybeSingle).toHaveBeenCalled();
    expect(updateChain.update).toHaveBeenCalledWith({ awarded_date: '2025-01-01' });
    expect(updateChain.eq).toHaveBeenCalledWith('id', 'la1');
    expect(result.ok).toBe(true);
  });

  it('inserts a new award when none exists', async () => {
    const findChain = makeChain({ data: null, error: null });
    const insertChain = makeChain({ data: { id: 'la2' }, error: null });
    from.mockReturnValueOnce(findChain).mockReturnValueOnce(insertChain);

    await setLevelAwardDate('p1', 2, '2025-02-01');
    expect(insertChain.insert).toHaveBeenCalledWith({ pathway_id: 'p1', level: 2, awarded_date: '2025-02-01' });
  });

  it('returns err when lookup fails', async () => {
    from.mockReturnValueOnce(makeChain({ data: null, error: { message: 'denied' } }));
    const result = await setLevelAwardDate('p1', 1, '2025-01-01');
    expect(result.ok).toBe(false);
  });
});

describe('deleteLevelAward', () => {
  it('deletes by id', async () => {
    const chain = makeChain({ data: null, error: null });
    from.mockReturnValue(chain);
    await deleteLevelAward('la1');
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith('id', 'la1');
  });
});
