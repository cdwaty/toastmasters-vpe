import { describe, it, expect } from 'vitest';
import type { AuthError } from '@supabase/supabase-js';
import { authErrorMessage } from './authErrors';

const makeError = (message: string): AuthError =>
  ({ message, name: 'AuthError', status: 400 } as AuthError);

describe('authErrorMessage', () => {
  it('returns null for null input', () => {
    expect(authErrorMessage(null)).toBeNull();
  });

  it('maps invalid login credentials', () => {
    expect(authErrorMessage(makeError('Invalid login credentials'))).toBe(
      'Incorrect email or password.',
    );
  });

  it('passes through unknown messages', () => {
    expect(authErrorMessage(makeError('Mystery'))).toBe('Mystery');
  });
});
