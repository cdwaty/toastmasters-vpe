import { describe, it, expect } from 'vitest';
import { parsePathwayHtml } from './pathwayHtml';

const wrap = (tableHtml: string) => `<!doctype html><html><body>${tableHtml}</body></html>`;

const baseTable = (rows: string) => wrap(`
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Date</th>
        <th>Title</th>
        <th>Manual/Project</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
`);

describe('parsePathwayHtml', () => {
  it('throws when no matching table found', () => {
    expect(() => parsePathwayHtml('<html><body><p>no table</p></body></html>')).toThrow(
      /Could not find the speech history table/,
    );
  });

  it('throws when required columns missing', () => {
    expect(() =>
      parsePathwayHtml(wrap(`
        <table>
          <thead><tr><th>Name</th><th>Other</th></tr></thead>
          <tbody><tr><td>Jane</td><td>thing</td></tr></tbody>
        </table>
      `)),
    ).toThrow();
  });

  it('parses a row with pathway, level, and project', () => {
    const html = baseTable(`
      <tr>
        <td>Doe, Jane</td>
        <td>2024-03-14</td>
        <td>My Talk</td>
        <td>Visionary Communication - Level 2 - Effective Body Language</td>
      </tr>
    `);
    const out = parsePathwayHtml(html);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({
      rawMemberName: 'Doe',
      rawPathwayName: 'Visionary Communication',
      rawProjectName: 'Effective Body Language',
      level: 2,
      date: '2024-03-14',
      title: 'My Talk',
    });
  });

  it('carries forward previous member when name cell empty', () => {
    const html = baseTable(`
      <tr>
        <td>Jane</td>
        <td>2024-01-01</td>
        <td>A</td>
        <td>Visionary - Level 1 - Ice Breaker</td>
      </tr>
      <tr>
        <td></td>
        <td>2024-02-01</td>
        <td>B</td>
        <td>Visionary - Level 1 - Researching</td>
      </tr>
    `);
    const out = parsePathwayHtml(html);
    expect(out).toHaveLength(2);
    expect(out[0].rawMemberName).toBe('Jane');
    expect(out[1].rawMemberName).toBe('Jane');
    expect(out[1].rawProjectName).toBe('Researching');
  });

  it('skips rows without a pathway in the project cell', () => {
    const html = baseTable(`
      <tr>
        <td>Jane</td>
        <td></td>
        <td></td>
        <td>Just a description</td>
      </tr>
    `);
    expect(parsePathwayHtml(html)).toEqual([]);
  });

  it('parses non-ISO dates into ISO format', () => {
    const html = baseTable(`
      <tr>
        <td>Jane</td>
        <td>March 14 2024</td>
        <td></td>
        <td>Visionary - Level 1 - Ice Breaker</td>
      </tr>
    `);
    const out = parsePathwayHtml(html);
    expect(out[0].date).toMatch(/^2024-03-14$/);
  });
});
