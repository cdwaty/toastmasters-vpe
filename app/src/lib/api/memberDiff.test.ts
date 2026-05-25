import { describe, it, expect } from 'vitest';
import type { Member } from '../../types';
import { diffMember } from './memberDiff';

const baseMember: Member = {
  id: 'm1',
  legacy_id: null,
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone: null,
  location: 'Auckland',
  member_type: 'Internal',
  club_preference: 'Tahi',
  join_date: '2024-01-01',
  exit_date: null,
  paid_until: '2025-01-01',
  education_award: null,
  aliases: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('diffMember', () => {
  it('returns no entries when patch is empty', () => {
    expect(diffMember(baseMember, {})).toEqual([]);
  });

  it('skips fields not present in patch', () => {
    expect(diffMember(baseMember, { phone: null })).toEqual([]);
  });

  it('records a changed field', () => {
    const entries = diffMember(baseMember, { full_name: 'Jane D' });
    expect(entries).toEqual([{ label: 'Full name', old_value: 'Jane Doe', new_value: 'Jane D' }]);
  });

  it('treats null and empty string as equivalent (no entry)', () => {
    expect(diffMember(baseMember, { phone: '' })).toEqual([]);
  });

  it('treats setting empty as a change when previously populated', () => {
    const entries = diffMember(baseMember, { email: '' });
    expect(entries).toEqual([{ label: 'Email', old_value: 'jane@example.com', new_value: null }]);
  });

  it('does not emit a change when same value supplied', () => {
    expect(diffMember(baseMember, { location: 'Auckland' })).toEqual([]);
  });

  it('emits multiple entries for multiple changes', () => {
    const entries = diffMember(baseMember, {
      location: 'Wellington',
      member_type: 'External',
    });
    expect(entries).toHaveLength(2);
    expect(entries.map(e => e.label).sort()).toEqual(['Location', 'Member type']);
  });

  it('ignores fields not tracked', () => {
    expect(diffMember(baseMember, { id: 'different', legacy_id: 'L' })).toEqual([]);
  });
});
