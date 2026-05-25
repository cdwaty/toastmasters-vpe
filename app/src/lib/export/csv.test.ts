import { describe, it, expect } from 'vitest';
import { rowsToCsv } from './csv';

describe('rowsToCsv', () => {
  it('produces a header and rows', () => {
    const out = rowsToCsv(
      [{ id: '1', name: 'Jane' }, { id: '2', name: 'John' }],
      ['id', 'name'],
    );
    expect(out).toBe('id,name\n1,Jane\n2,John');
  });

  it('quotes values containing commas, quotes, or newlines', () => {
    const out = rowsToCsv(
      [{ name: 'Doe, Jane' }, { name: 'has "quotes"' }, { name: 'line\nbreak' }],
      ['name'],
    );
    expect(out).toBe('name\n"Doe, Jane"\n"has ""quotes"""\n"line\nbreak"');
  });

  it('renders null/undefined as empty', () => {
    const out = rowsToCsv([{ a: null, b: undefined }], ['a', 'b']);
    expect(out).toBe('a,b\n,');
  });

  it('joins arrays with "; " for CSV cells', () => {
    const out = rowsToCsv([{ aliases: ['Jane', 'JD'] }], ['aliases']);
    expect(out).toBe('aliases\nJane; JD');
  });

  it('handles empty rows array (header only)', () => {
    expect(rowsToCsv([] as { id: string }[], ['id'])).toBe('id\n');
  });
});
