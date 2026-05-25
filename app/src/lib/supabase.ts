import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

/**
 * Supabase client.
 *
 * Session storage strategy:
 * - storage: sessionStorage → per-tab, dies when tab/window closes (Req 6.3/6.4).
 * - persistSession: true → required to write session to sessionStorage so it
 *   survives page refresh within the same tab (Req 3.4). Setting this to false
 *   would force an in-memory session that's lost on every refresh.
 * - autoRefreshToken: true → silently refreshes access tokens before expiry.
 * - detectSessionInUrl: true → picks up recovery/invite tokens from the URL hash.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
