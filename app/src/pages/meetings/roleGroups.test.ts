import { describe, it, expect } from 'vitest';
import { ROLE_GROUPS, MULTI_SLOT_KEYS } from './roleGroups';

describe('ROLE_GROUPS', () => {
  it('contains four groups', () => {
    expect(ROLE_GROUPS).toHaveLength(4);
  });

  it('every role key is unique across groups', () => {
    const all = ROLE_GROUPS.flatMap(g => g.keys);
    expect(new Set(all).size).toBe(all.length);
  });

  it('every group has a label and at least one key', () => {
    for (const g of ROLE_GROUPS) {
      expect(g.label).toBeTruthy();
      expect(g.keys.length).toBeGreaterThan(0);
    }
  });
});

describe('MULTI_SLOT_KEYS', () => {
  it('contains the expected multi-slot role keys', () => {
    expect(MULTI_SLOT_KEYS.has('speaker')).toBe(true);
    expect(MULTI_SLOT_KEYS.has('evaluator')).toBe(true);
    expect(MULTI_SLOT_KEYS.has('tt_speaker')).toBe(true);
    expect(MULTI_SLOT_KEYS.has('chair')).toBe(false);
    expect(MULTI_SLOT_KEYS.has('toastmaster')).toBe(false);
  });

  it('every multi-slot key exists in ROLE_GROUPS', () => {
    const all = new Set<string>(ROLE_GROUPS.flatMap(g => g.keys));
    for (const key of MULTI_SLOT_KEYS) {
      expect(all.has(key)).toBe(true);
    }
  });
});
