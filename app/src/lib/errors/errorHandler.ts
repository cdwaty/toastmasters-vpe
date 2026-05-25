import type { AuthError, PostgrestError } from '@supabase/supabase-js';
import { createAppError, type AppError, type ErrorCategory } from './errorTypes';
import { authMessage, databaseMessage, networkMessage } from './errorMessages';

function isAuthError(error: unknown): error is AuthError {
  return typeof error === 'object' && error !== null && '__isAuthError' in error;
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return typeof error === 'object' && error !== null
    && 'code' in error && 'message' in error && 'details' in error;
}

function rawMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error';
}

export function toAppError(error: unknown, category: ErrorCategory = 'unknown'): AppError {
  const raw = rawMessage(error);

  if (isAuthError(error)) {
    return createAppError('auth', authMessage(raw), { detail: raw, cause: error });
  }

  if (isPostgrestError(error)) {
    return createAppError('database', databaseMessage(raw), { detail: raw, cause: error });
  }

  if (raw.toLowerCase().includes('fetch') || raw.toLowerCase().includes('network')) {
    return createAppError('network', networkMessage(raw), { detail: raw, cause: error });
  }

  if (category === 'validation') {
    return createAppError('validation', raw, { cause: error });
  }

  return createAppError(category, raw, { cause: error });
}

export function appErrorMessage(error: unknown, category?: ErrorCategory): string {
  return toAppError(error, category).message;
}
