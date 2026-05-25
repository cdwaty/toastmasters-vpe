import {
  createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode,
} from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { log } from '../lib/logger';
import { config } from '../lib/config';
import { routes } from '../lib/routes';

const { idleTimeoutMs: IDLE_TIMEOUT_MS, idleCheckIntervalMs: IDLE_CHECK_INTERVAL_MS } = config.auth;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (pw: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      log.setUser(data.session?.user?.id ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      log.setUser(s?.user?.id ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error };
  }, []);
  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  useEffect(() => {
    if (!user) return;
    const markActive = () => { lastActivityRef.current = Date.now(); };
    markActive();
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, markActive, { passive: true }));
    const checkIdle = () => {
      if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
        void signOut().catch(e => log.error('idle signout failed', e));
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkIdle();
    };
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(checkIdle, IDLE_CHECK_INTERVAL_MS);
    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, markActive));
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
    };
  }, [user, signOut]);
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${routes.resetPassword}`,
    });
    return { error };
  }, []);
  const updatePassword = useCallback(async (pw: string) => {
    const { error } = await supabase.auth.updateUser({ password: pw });
    return { error };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
