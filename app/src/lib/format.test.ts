import { describe, it, expect } from 'vitest';
import { formatDate, formatDateLong, formatMonthDay, formatDateTime } from './format';

describe('formatDate', () => {
  it('returns fallback for null/undefined/empty', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('returns fallback for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('respects custom fallback', () => {
    expect(formatDate(null, 'N/A')).toBe('N/A');
  });

  it('formats a valid ISO date', () => {
    const out = formatDate('2025-03-14');
    expect(out).not.toBe('—');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
});

describe('formatDateLong', () => {
  it('returns fallback for null', () => {
    expect(formatDateLong(null)).toBe('—');
  });

  it('formats valid date with weekday', () => {
    const out = formatDateLong('2025-03-14');
    expect(out).not.toBe('—');
  });
});

describe('formatMonthDay', () => {
  it('returns dash struct for null', () => {
    expect(formatMonthDay(null)).toEqual({ day: '—', month: '', year: '' });
  });

  it('returns dash struct for invalid', () => {
    expect(formatMonthDay('bad')).toEqual({ day: '—', month: '', year: '' });
  });

  it('returns parts for valid date', () => {
    const parts = formatMonthDay('2025-03-14T00:00:00Z');
    expect(parts.day).toMatch(/^\d{1,2}$/);
    expect(parts.month).toMatch(/^[A-Z]{3,}/);
    expect(parts.year).toBe('2025');
  });
});

describe('formatDateTime', () => {
  it('returns dash for invalid input', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('garbage')).toBe('—');
  });

  it('formats a valid datetime', () => {
    const out = formatDateTime('2025-03-14T10:00:00Z');
    expect(out).not.toBe('—');
  });
});
