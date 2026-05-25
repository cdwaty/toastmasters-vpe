import { vi, type Mock } from 'vitest';

type QueryResult = { data?: unknown; error?: unknown; count?: number };

export interface ChainMock {
  select: Mock;
  insert: Mock;
  update: Mock;
  delete: Mock;
  upsert: Mock;
  eq: Mock;
  in: Mock;
  or: Mock;
  order: Mock;
  limit: Mock;
  range: Mock;
  single: Mock;
  maybeSingle: Mock;
  then: (resolve: (v: QueryResult) => unknown, reject?: (e: unknown) => unknown) => Promise<unknown>;
}

export function makeChain(result: QueryResult): ChainMock {
  const chain = {} as ChainMock;
  const chainMethods: (keyof ChainMock)[] = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'in', 'or', 'order', 'limit', 'range', 'single', 'maybeSingle',
  ];
  for (const method of chainMethods) {
    (chain as unknown as Record<string, unknown>)[method] = vi.fn(() => chain);
  }
  chain.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return chain;
}

export function makeSupabaseMock() {
  return { from: vi.fn(), auth: { getSession: vi.fn(), onAuthStateChange: vi.fn() } };
}
