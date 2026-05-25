import { describe, it, expect } from 'vitest';
import { mergeLocations, DEFAULT_LOCATIONS } from './locations';

describe('mergeLocations', () => {
  it('returns defaults sorted when no member locations supplied', () => {
    const out = mergeLocations([]);
    expect(out).toEqual([...DEFAULT_LOCATIONS].sort());
  });

  it('skips null, undefined and empty strings', () => {
    const out = mergeLocations([null, undefined, '', '   ']);
    expect(out).toEqual([...DEFAULT_LOCATIONS].sort());
  });

  it('adds new locations not in defaults', () => {
    const out = mergeLocations(['Dunedin']);
    expect(out).toContain('Dunedin');
  });

  it('deduplicates case-insensitively, keeping default casing', () => {
    const out = mergeLocations(['auckland', 'AUCKLAND']);
    expect(out.filter(l => l.toLowerCase() === 'auckland')).toEqual(['Auckland']);
  });

  it('normalizes inner whitespace', () => {
    const out = mergeLocations(['New  Plymouth   ']);
    expect(out).toContain('New Plymouth');
  });

  it('result is sorted alphabetically', () => {
    const out = mergeLocations(['Zzz', 'Aaa']);
    const sorted = [...out].sort();
    expect(out).toEqual(sorted);
  });
});
