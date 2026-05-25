function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function bigrams(value: string): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < value.length - 1; i++) {
    const pair = value.slice(i, i + 2);
    map.set(pair, (map.get(pair) ?? 0) + 1);
  }
  return map;
}

export function diceCoefficient(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;

  const aGrams = bigrams(na);
  const bGrams = bigrams(nb);
  let intersection = 0;
  for (const [key, count] of aGrams) {
    const otherCount = bGrams.get(key);
    if (otherCount) intersection += Math.min(count, otherCount);
  }

  const totalA = [...aGrams.values()].reduce((s, n) => s + n, 0);
  const totalB = [...bGrams.values()].reduce((s, n) => s + n, 0);
  return (2 * intersection) / (totalA + totalB);
}

export interface FuzzyMatch<T> {
  candidate: T;
  score: number;
}

export function bestMatch<T>(
  query: string,
  candidates: T[],
  toString: (candidate: T) => string,
): FuzzyMatch<T> | null {
  if (candidates.length === 0) return null;
  let best: FuzzyMatch<T> | null = null;
  for (const candidate of candidates) {
    const score = diceCoefficient(query, toString(candidate));
    if (!best || score > best.score) best = { candidate, score };
  }
  return best;
}
