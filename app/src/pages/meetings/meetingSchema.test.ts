import { describe, it, expect } from 'vitest';
import {
  meetingSchema,
  mergeNotesWithGuests,
  parseGuestList,
  splitNotesAndGuests,
} from './meetingSchema';

describe('meetingSchema', () => {
  it('accepts a minimal valid meeting', () => {
    const result = meetingSchema.safeParse({ meeting_date: '2025-04-01' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.meeting_type).toBe('Regular');
      expect(result.data.status).toBe('Draft');
      expect(result.data.title).toBeNull();
    }
  });

  it('requires meeting_date', () => {
    expect(meetingSchema.safeParse({ meeting_date: '' }).success).toBe(false);
  });

  it('rejects bad enums', () => {
    expect(meetingSchema.safeParse({ meeting_date: '2025-01-01', meeting_type: 'Weird' }).success).toBe(false);
    expect(meetingSchema.safeParse({ meeting_date: '2025-01-01', status: 'Final' }).success).toBe(false);
  });

  it('converts empty title to null', () => {
    const r = meetingSchema.safeParse({ meeting_date: '2025-01-01', title: '   ' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBeNull();
  });
});

describe('mergeNotesWithGuests', () => {
  it('returns null when both empty', () => {
    expect(mergeNotesWithGuests(null, null)).toBeNull();
    expect(mergeNotesWithGuests('', '')).toBeNull();
  });

  it('returns notes only when no guests', () => {
    expect(mergeNotesWithGuests('hello', null)).toBe('hello');
  });

  it('returns guest block when no notes', () => {
    const out = mergeNotesWithGuests(null, 'Alice');
    expect(out).toMatch(/--- GUESTS ---\nAlice/);
  });

  it('appends guests block after notes with blank line', () => {
    const out = mergeNotesWithGuests('hello', 'Alice');
    expect(out).toBe('hello\n\n--- GUESTS ---\nAlice');
  });
});

describe('splitNotesAndGuests', () => {
  it('returns null parts for null input', () => {
    expect(splitNotesAndGuests(null)).toEqual({ notes: null, guestList: null });
  });

  it('returns combined as notes when marker absent', () => {
    expect(splitNotesAndGuests('just notes')).toEqual({ notes: 'just notes', guestList: null });
  });

  it('splits when marker present', () => {
    const out = splitNotesAndGuests('notes\n\n--- GUESTS ---\nAlice\nBob');
    expect(out.notes).toBe('notes');
    expect(out.guestList).toBe('Alice\nBob');
  });

  it('round-trips with mergeNotesWithGuests', () => {
    const merged = mergeNotesWithGuests('hello', 'Alice\nBob');
    expect(splitNotesAndGuests(merged)).toEqual({ notes: 'hello', guestList: 'Alice\nBob' });
  });
});

describe('parseGuestList', () => {
  it('returns empty for null/empty', () => {
    expect(parseGuestList(null)).toEqual([]);
    expect(parseGuestList('')).toEqual([]);
  });

  it('splits on newline and comma, trims, drops blanks', () => {
    expect(parseGuestList('Alice, Bob\nCharlie,, ')).toEqual(['Alice', 'Bob', 'Charlie']);
  });
});
