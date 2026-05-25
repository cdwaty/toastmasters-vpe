import { describe, it, expect } from 'vitest';
import { memberSchema } from './memberSchema';

const baseInput = {
  full_name: 'Jane Doe',
  email: '',
  phone: '',
  location: '',
  member_type: '',
  club_preference: '',
  join_date: '',
  exit_date: '',
  paid_until: '',
  education_award: '',
};

describe('memberSchema', () => {
  it('accepts a minimal valid input', () => {
    const result = memberSchema.safeParse({
      full_name: 'Jane Doe',
      email: '',
      phone: '',
      location: '',
      member_type: '',
      club_preference: '',
      join_date: '',
      exit_date: '',
      paid_until: '',
      education_award: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.full_name).toBe('Jane Doe');
      expect(result.data.email).toBeNull();
      expect(result.data.member_type).toBeNull();
    }
  });

  it('requires full_name', () => {
    expect(memberSchema.safeParse({ ...baseInput, full_name: '   ' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(memberSchema.safeParse({ ...baseInput, email: 'not-an-email' }).success).toBe(false);
  });

  it('accepts a valid email', () => {
    const result = memberSchema.safeParse({ ...baseInput, email: 'ok@example.com' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('ok@example.com');
  });

  it('coerces empty strings to null for optional fields', () => {
    const result = memberSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.location).toBeNull();
      expect(result.data.join_date).toBeNull();
    }
  });

  it('enforces member_type enum', () => {
    expect(memberSchema.safeParse({ ...baseInput, member_type: 'Internal' }).success).toBe(true);
    expect(memberSchema.safeParse({ ...baseInput, member_type: 'Bogus' }).success).toBe(false);
  });

  it('enforces club_preference enum', () => {
    expect(memberSchema.safeParse({ ...baseInput, club_preference: 'Tahi' }).success).toBe(true);
    expect(memberSchema.safeParse({ ...baseInput, club_preference: 'Bogus' }).success).toBe(false);
  });
});
