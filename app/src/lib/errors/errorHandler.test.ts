import { describe, it, expect } from 'vitest';
import { toAppError, appErrorMessage } from './errorHandler';
import { createAppError } from './errorTypes';

describe('toAppError', () => {
  it('maps a Supabase AuthError (has __isAuthError)', () => {
    const err = { __isAuthError: true, message: 'Invalid login credentials', name: 'AuthError' };
    const out = toAppError(err);
    expect(out.category).toBe('auth');
    expect(out.message).toBe('Incorrect email or password.');
    expect(out.detail).toBe('Invalid login credentials');
  });

  it('maps a PostgrestError (has code, message, details)', () => {
    const err = { code: '23505', message: 'duplicate key violates unique constraint', details: 'x' };
    const out = toAppError(err);
    expect(out.category).toBe('database');
    expect(out.message).toMatch(/already exists/);
  });

  it('maps network errors by keyword', () => {
    expect(toAppError(new Error('Failed to fetch')).category).toBe('network');
    expect(toAppError(new Error('NetworkError when attempting...')).category).toBe('network');
  });

  it('uses provided category for validation', () => {
    const out = toAppError('Required field missing', 'validation');
    expect(out.category).toBe('validation');
    expect(out.message).toBe('Required field missing');
  });

  it('falls back to category=unknown for plain Error', () => {
    const out = toAppError(new Error('mystery'));
    expect(out.category).toBe('unknown');
    expect(out.message).toBe('mystery');
  });

  it('handles string input', () => {
    const out = toAppError('boom');
    expect(out.category).toBe('unknown');
    expect(out.message).toBe('boom');
  });

  it('handles unknown object', () => {
    const out = toAppError({ foo: 1 });
    expect(out.message).toBe('Unknown error');
  });
});

describe('appErrorMessage', () => {
  it('returns the same message that toAppError produces', () => {
    expect(appErrorMessage('Failed to fetch')).toMatch(/Network/);
  });
});

describe('createAppError', () => {
  it('builds AppError with optional detail and cause', () => {
    const cause = new Error('orig');
    const out = createAppError('database', 'msg', { detail: 'd', cause });
    expect(out).toEqual({ category: 'database', message: 'msg', detail: 'd', cause });
  });

  it('omits detail/cause when not provided', () => {
    const out = createAppError('unknown', 'msg');
    expect(out.detail).toBeUndefined();
    expect(out.cause).toBeUndefined();
  });
});
