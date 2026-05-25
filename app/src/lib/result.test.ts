import { describe, it, expect } from 'vitest';
import { ok, err, toError } from './result';

describe('result', () => {
  it('ok wraps data', () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toBe(42);
  });

  it('err wraps error', () => {
    const e = new Error('boom');
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });
});

describe('toError', () => {
  it('passes through Error instance', () => {
    const e = new Error('x');
    expect(toError(e)).toBe(e);
  });

  it('wraps string', () => {
    const e = toError('boom');
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toBe('boom');
  });

  it('wraps object with message', () => {
    const e = toError({ message: 'supabase error' });
    expect(e.message).toBe('supabase error');
  });

  it('falls back to Unknown error for unrecognized input', () => {
    expect(toError(null).message).toBe('Unknown error');
    expect(toError(undefined).message).toBe('Unknown error');
    expect(toError(42).message).toBe('Unknown error');
    expect(toError({}).message).toBe('Unknown error');
    expect(toError({ message: 123 }).message).toBe('Unknown error');
  });
});
