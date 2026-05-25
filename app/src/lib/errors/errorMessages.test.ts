import { describe, it, expect } from 'vitest';
import { authMessage, databaseMessage, networkMessage } from './errorMessages';

describe('authMessage', () => {
  it.each([
    ['Invalid login credentials', 'Incorrect email or password.'],
    ['Email not confirmed', 'Please verify your email before signing in. Check your inbox for the setup link.'],
    ['Signups not allowed for this instance', 'Public signups are disabled. Contact your administrator.'],
    ['Rate limit exceeded', 'Too many attempts. Try again in a few minutes.'],
    ['Too many requests', 'Too many attempts. Try again in a few minutes.'],
    ['Token has expired', 'This link has expired. Request a new one.'],
    ['User not found', 'No account found for that email.'],
  ])('maps "%s" to friendly message', (raw, expected) => {
    expect(authMessage(raw)).toBe(expected);
  });

  it('returns raw message when no rule matches', () => {
    expect(authMessage('Some new edge case')).toBe('Some new edge case');
  });
});

describe('databaseMessage', () => {
  it('maps duplicate key', () => {
    expect(databaseMessage('duplicate key value violates unique constraint')).toBe(
      'A record with that identifier already exists.',
    );
  });

  it('maps foreign key', () => {
    expect(databaseMessage('foreign key violation')).toMatch(/depends on/);
  });

  it('maps RLS / permission denied', () => {
    expect(databaseMessage('row-level security policy')).toMatch(/permission/);
    expect(databaseMessage('permission denied for table')).toMatch(/permission/);
  });

  it('falls back to generic db error', () => {
    expect(databaseMessage('weird postgres thing')).toBe('Database error. Please try again.');
  });
});

describe('networkMessage', () => {
  it('maps fetch failure', () => {
    expect(networkMessage('Failed to fetch')).toMatch(/Network/);
  });

  it('maps timeout', () => {
    expect(networkMessage('Request timeout')).toMatch(/timed out/);
  });

  it('falls back to generic connection error', () => {
    expect(networkMessage('odd thing')).toBe('Connection error. Please try again.');
  });
});
