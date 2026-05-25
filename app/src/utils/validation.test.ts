import { describe, it, expect } from 'vitest';
import { validatePassword, validateEmail, PASSWORD_MIN_LENGTH } from './validation';

describe('validatePassword', () => {
  it('accepts a valid strong password', () => {
    expect(validatePassword('Abcdef12')).toBeNull();
  });

  it('rejects when too short', () => {
    expect(validatePassword('Ab1')).not.toBeNull();
  });

  it('rejects missing uppercase', () => {
    expect(validatePassword('abcdef12')).not.toBeNull();
  });

  it('rejects missing lowercase', () => {
    expect(validatePassword('ABCDEF12')).not.toBeNull();
  });

  it('rejects missing digit', () => {
    expect(validatePassword('Abcdefgh')).not.toBeNull();
  });

  it('PASSWORD_MIN_LENGTH is 8', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });
});

describe('validateEmail', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('seelan@example.com')).toBeNull();
  });

  it('trims whitespace before validating', () => {
    expect(validateEmail('  ok@example.com  ')).toBeNull();
  });

  it('rejects empty', () => {
    expect(validateEmail('')).toBe('Email is required.');
    expect(validateEmail('   ')).toBe('Email is required.');
  });

  it('rejects malformed addresses', () => {
    expect(validateEmail('no-at-symbol')).not.toBeNull();
    expect(validateEmail('a@b')).not.toBeNull();
    expect(validateEmail('a @b.com')).not.toBeNull();
    expect(validateEmail('@b.com')).not.toBeNull();
  });
});
