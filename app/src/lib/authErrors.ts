import type { AuthError } from '@supabase/supabase-js';
import { authMessage } from './errors/errorMessages';

export function authErrorMessage(error: AuthError | null): string | null {
  if (!error) return null;
  return authMessage(error.message);
}
