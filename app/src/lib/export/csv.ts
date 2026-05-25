function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = Array.isArray(value) ? value.join('; ') : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function rowsToCsv<T extends Record<string, unknown>>(rows: T[], columns: (keyof T)[]): string {
  const header = columns.map(c => csvEscape(c as string)).join(',');
  const body = rows.map(row => columns.map(col => csvEscape(row[col])).join(',')).join('\n');
  return `${header}\n${body}`;
}
