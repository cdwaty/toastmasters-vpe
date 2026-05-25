import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { config } from '../../lib/config';

type Status = 'checking' | 'ok' | 'invalid';

const FALLBACK_MS = config.auth.authLinkFallbackMs;

export function useAuthLinkSession(): Status {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let settled = false;
    const settle = (next: Status) => {
      if (settled) return;
      settled = true;
      setStatus(next);
    };

    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) settle('ok');
      })
      .catch(() => {
        // ignore; fallback timeout will settle('invalid')
      });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION') {
        if (session) settle('ok');
      }
    });

    const timeout = setTimeout(() => settle('invalid'), FALLBACK_MS);

    return () => {
      settled = true;
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  return status;
}
