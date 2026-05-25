export const DEFAULT_LOCATIONS = [
  'Auckland', 'Wellington', 'Hamilton', 'Christchurch', 'Nelson', 'Tauranga', 'Australia',
] as const;

function normalizeLocation(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/[ \s]+/g, ' ')
    .trim();
}

export function mergeLocations(memberLocations: (string | null | undefined)[]): string[] {
  const byLower = new Map<string, string>();
  for (const loc of DEFAULT_LOCATIONS) byLower.set(loc.toLowerCase(), loc);
  for (const loc of memberLocations) {
    const normalized = normalizeLocation(loc);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (!byLower.has(key)) byLower.set(key, normalized);
  }
  return [...byLower.values()].sort();
}
