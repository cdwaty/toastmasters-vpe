import { describe, it, expect } from 'vitest';
import type { Member } from '../../types';
import { membersToCsv } from './membersCsv';

const member = (over: Partial<Member>): Member => ({
  id: 'm1',
  legacy_id: 'L1',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '021',
  location: 'Auckland',
  member_type: 'Internal',
  club_preference: 'Tahi',
  join_date: '2024-01-01',
  exit_date: null,
  paid_until: '2025-01-01',
  education_award: null,
  aliases: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  ...over,
});

describe('membersToCsv', () => {
  it('produces a header line with all columns in fixed order', () => {
    const out = membersToCsv([]);
    expect(out.split('\n')[0]).toBe(
      'legacy_id,full_name,email,phone,location,member_type,club_preference,join_date,exit_date,paid_until,education_award,aliases',
    );
  });

  it('writes one row per member with nulls coerced to empty', () => {
    const out = membersToCsv([member({})]);
    const rows = out.split('\n');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toBe('L1,Jane Doe,jane@example.com,021,Auckland,Internal,Tahi,2024-01-01,,2025-01-01,,');
  });

  it('joins aliases with "; " when present', () => {
    const out = membersToCsv([member({ aliases: ['JD', 'Janey'] })]);
    expect(out).toMatch(/JD; Janey/);
  });

  it('quotes commas in fields', () => {
    const out = membersToCsv([member({ full_name: 'Doe, Jane' })]);
    expect(out).toMatch(/"Doe, Jane"/);
  });
});
