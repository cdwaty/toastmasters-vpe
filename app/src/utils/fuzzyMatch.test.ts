import { describe, it, expect } from 'vitest';
import { diceCoefficient, bestMatch } from './fuzzyMatch';

describe('diceCoefficient', () => {
  it('returns 1 for identical strings after normalization', () => {
    expect(diceCoefficient('John Smith', 'john smith')).toBe(1);
    expect(diceCoefficient('John-Smith', 'john smith')).toBe(1);
  });

  it('returns 0 when either side is empty', () => {
    expect(diceCoefficient('', 'john')).toBe(0);
    expect(diceCoefficient('john', '')).toBe(0);
    expect(diceCoefficient('', '')).toBe(0);
  });

  it('returns 0 for completely different strings', () => {
    expect(diceCoefficient('aaaa', 'bbbb')).toBe(0);
  });

  it('returns a positive score for similar strings', () => {
    const score = diceCoefficient('John Smith', 'Jon Smyth');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('handles single-char strings by returning 0 (no bigrams)', () => {
    expect(diceCoefficient('a', 'a')).toBe(1);
    expect(diceCoefficient('a', 'b')).toBe(0);
  });

  it('is symmetric', () => {
    const a = diceCoefficient('Jane Doe', 'John Doe');
    const b = diceCoefficient('John Doe', 'Jane Doe');
    expect(a).toBe(b);
  });
});

describe('bestMatch', () => {
  const members = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Jane Doe' },
    { id: '3', name: 'Robert Brown' },
  ];

  it('returns null for empty candidates', () => {
    expect(bestMatch('anyone', [], (c: { name: string }) => c.name)).toBeNull();
  });

  it('finds the closest candidate', () => {
    const result = bestMatch('Jon Smith', members, m => m.name);
    expect(result?.candidate.id).toBe('1');
    expect(result?.score).toBeGreaterThan(0);
  });

  it('returns the only candidate even with score 0', () => {
    const result = bestMatch('zzzzz', [{ name: 'aaa' }], c => c.name);
    expect(result?.candidate.name).toBe('aaa');
    expect(result?.score).toBe(0);
  });
});
