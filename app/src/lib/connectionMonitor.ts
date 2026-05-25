import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { config } from './config';

const HEALTH_CHECK_INTERVAL_MS = config.connection.healthCheckIntervalMs;

async function pingSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase.from('role_types').select('id', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

export function useConnectionStatus(): { online: boolean; reachable: boolean } {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [reachable, setReachable] = useState<boolean>(true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const ok = await pingSupabase();
      if (!cancelled) setReachable(ok);
    };
    check();
    const interval = window.setInterval(check, HEALTH_CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return { online, reachable };
}
