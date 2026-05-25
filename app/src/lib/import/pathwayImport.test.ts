import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../../test/supabaseMock';
import { ok } from '../result';
import type { Member, PathwayTypeWithStructure } from '../../types';
import type { PathwayHtmlEntry } from './pathwayHtml';
import type { PathwayImportMatch } from './pathwayImport';

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() },
}));
vi.mock('../api/changeHistory', () => ({
  recordMemberHistory: vi.fn(),
}));

import { supabase } from '../supabase';
import { recordMemberHistory } from '../api/changeHistory';
import { matchPathwayEntries, importMatchedPathways } from './pathwayImport';

const from = supabase.from as ReturnType<typeof vi.fn>;
const recordHistoryMock = recordMemberHistory as ReturnType<typeof vi.fn>;

const makeMember = (id: string, full_name: string, aliases: string[] | null = null): Member => ({
  id,
  legacy_id: null,
  full_name,
  email: null,
  phone: null,
  location: null,
  member_type: null,
  club_preference: null,
  join_date: null,
  exit_date: null,
  paid_until: null,
  education_award: null,
  aliases,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
});

const makePathwayType = (id: string, pathway_name: string): PathwayTypeWithStructure => ({
  id,
  pathway_key: pathway_name.toLowerCase().replace(/\s+/g, '_'),
  pathway_name,
  is_legacy: false,
  sort_order: 0,
  is_active: true,
  pathway_levels: [],
});

const makeEntry = (over: Partial<PathwayHtmlEntry>): PathwayHtmlEntry => ({
  rawMemberName: 'Jane Doe',
  rawPathwayName: 'Visionary Communication',
  rawProjectName: 'Ice Breaker',
  level: 1,
  date: '2024-01-01',
  title: '',
  ...over,
});

const matchWith = (over: Partial<PathwayImportMatch> = {}): PathwayImportMatch => ({
  rawMemberName: 'Jane Doe',
  rawPathwayName: 'Visionary Communication',
  member: makeMember('m1', 'Jane Doe'),
  memberScore: 0.9,
  pathwayType: makePathwayType('pt1', 'Visionary Communication'),
  pathwayScore: 0.9,
  entries: [makeEntry({})],
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  recordHistoryMock.mockResolvedValue(ok(undefined));
});

describe('matchPathwayEntries', () => {
  const members = [makeMember('m1', 'Jane Doe'), makeMember('m2', 'John Smith')];
  const pathwayTypes = [
    makePathwayType('p1', 'Visionary Communication'),
    makePathwayType('p2', 'Dynamic Leadership'),
  ];

  it('returns one match per (member, pathway) group, with all entries collected', () => {
    const entries = [
      makeEntry({ level: 1 }),
      makeEntry({ level: 2, rawProjectName: 'Researching' }),
    ];
    const result = matchPathwayEntries(entries, members, pathwayTypes);
    expect(result).toHaveLength(1);
    expect(result[0].entries).toHaveLength(2);
    expect(result[0].member?.id).toBe('m1');
    expect(result[0].pathwayType?.id).toBe('p1');
  });

  it('returns separate matches for different member/pathway combos', () => {
    const entries = [
      makeEntry({ rawMemberName: 'Jane Doe' }),
      makeEntry({ rawMemberName: 'John Smith' }),
    ];
    const result = matchPathwayEntries(entries, members, pathwayTypes);
    expect(result).toHaveLength(2);
  });

  it('matches by alias when fuzzy match fails', () => {
    const aliased = [makeMember('m1', 'Janet Smyth', ['Janie'])];
    const result = matchPathwayEntries(
      [makeEntry({ rawMemberName: 'Janie' })],
      aliased,
      pathwayTypes,
    );
    expect(result[0].member?.id).toBe('m1');
    expect(result[0].memberScore).toBe(1);
  });

  it('leaves member null when score below threshold and no alias', () => {
    const result = matchPathwayEntries(
      [makeEntry({ rawMemberName: 'XyZ Qqq' })],
      members,
      pathwayTypes,
    );
    expect(result[0].member).toBeNull();
  });

  it('leaves pathwayType null when score below threshold', () => {
    const result = matchPathwayEntries(
      [makeEntry({ rawPathwayName: 'Zzz Qqq Bogus' })],
      members,
      pathwayTypes,
    );
    expect(result[0].pathwayType).toBeNull();
  });
});

describe('importMatchedPathways', () => {
  it('skips matches with null member or null pathway type', async () => {
    const result = await importMatchedPathways([
      matchWith({ member: null }),
      matchWith({ pathwayType: null }),
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ pathwaysCreated: 0, completionsCreated: 0, skipped: 2 });
    expect(from).not.toHaveBeenCalled();
  });

  it('creates a new pathway when none exists, then inserts completions', async () => {
    const findChain = makeChain({ data: null, error: null });
    const insertPathwayChain = makeChain({ data: { id: 'p-new' }, error: null });
    const insertCompletionsChain = makeChain({ data: null, count: 1, error: null });
    from
      .mockReturnValueOnce(findChain)
      .mockReturnValueOnce(insertPathwayChain)
      .mockReturnValueOnce(insertCompletionsChain);

    const result = await importMatchedPathways([matchWith()]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ pathwaysCreated: 1, completionsCreated: 1, skipped: 0 });

    expect(findChain.eq).toHaveBeenCalledWith('member_id', 'm1');
    expect(findChain.eq).toHaveBeenCalledWith('pathway_type_id', 'pt1');
    expect(insertPathwayChain.insert).toHaveBeenCalledWith({
      member_id: 'm1', pathway_type_id: 'pt1', is_primary: false, current_level: 1,
    });
    expect(insertCompletionsChain.insert).toHaveBeenCalledWith(
      [{
        pathway_id: 'p-new',
        level: 1,
        project_name: 'Ice Breaker',
        completion_date: '2024-01-01',
        speech_title: null,
      }],
      { count: 'exact' },
    );
    expect(recordHistoryMock).toHaveBeenCalledWith('m1', [
      expect.objectContaining({ label: expect.stringMatching(/Visionary Communication/) }),
    ]);
  });

  it('reuses an existing pathway instead of creating a new one', async () => {
    const findChain = makeChain({ data: { id: 'p-existing' }, error: null });
    const insertCompletionsChain = makeChain({ data: null, count: 1, error: null });
    from.mockReturnValueOnce(findChain).mockReturnValueOnce(insertCompletionsChain);

    const result = await importMatchedPathways([matchWith()]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.pathwaysCreated).toBe(0);
  });

  it('filters out entries with invalid level (null, out of range)', async () => {
    const findChain = makeChain({ data: { id: 'p1' }, error: null });
    from.mockReturnValueOnce(findChain);

    const result = await importMatchedPathways([
      matchWith({
        entries: [
          makeEntry({ level: null }),
          makeEntry({ level: 0 }),
          makeEntry({ level: 6 }),
        ],
      }),
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.completionsCreated).toBe(0);
  });

  it('returns err if pathway lookup fails', async () => {
    from.mockReturnValueOnce(makeChain({ data: null, error: { message: 'denied' } }));
    const result = await importMatchedPathways([matchWith()]);
    expect(result.ok).toBe(false);
  });

  it('returns err if pathway insert fails', async () => {
    from
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: { message: 'denied' } }));
    const result = await importMatchedPathways([matchWith()]);
    expect(result.ok).toBe(false);
  });

  it('returns err if completions insert fails', async () => {
    from
      .mockReturnValueOnce(makeChain({ data: { id: 'p1' }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: { message: 'denied' } }));
    const result = await importMatchedPathways([matchWith()]);
    expect(result.ok).toBe(false);
  });
});
