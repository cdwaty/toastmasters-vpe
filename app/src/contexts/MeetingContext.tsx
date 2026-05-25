import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import type { Meeting } from '../types';
import { useAuth } from './AuthContext';
import * as meetingsApi from '../lib/api/meetings';

interface MeetingContextValue {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getMeeting: (id: string) => Meeting | undefined;
  addMeeting: (input: Partial<Meeting>) => Promise<Meeting | null>;
  updateMeeting: (id: string, patch: Partial<Meeting>) => Promise<Meeting | null>;
  deleteMeeting: (id: string) => Promise<boolean>;
}

const MeetingContext = createContext<MeetingContextValue | undefined>(undefined);

export function MeetingProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshIdRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!session) return;
    const requestId = ++refreshIdRef.current;
    setLoading(true);
    setError(null);
    const result = await meetingsApi.listMeetings();
    if (requestId !== refreshIdRef.current) return;
    if (result.ok) setMeetings(result.data);
    else setError(result.error.message);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) refresh();
    else setMeetings([]);
  }, [session, refresh]);

  const getMeeting = useCallback((id: string) => meetings.find(m => m.id === id), [meetings]);

  const addMeeting = useCallback(async (input: Partial<Meeting>) => {
    const result = await meetingsApi.createMeeting(input);
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    setMeetings(prev => [result.data, ...prev]);
    return result.data;
  }, []);

  const updateMeeting = useCallback(async (id: string, patch: Partial<Meeting>) => {
    const result = await meetingsApi.updateMeeting(id, patch);
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    setMeetings(prev => prev.map(m => (m.id === id ? result.data : m)));
    return result.data;
  }, []);

  const deleteMeeting = useCallback(async (id: string) => {
    const result = await meetingsApi.deleteMeeting(id);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    setMeetings(prev => prev.filter(m => m.id !== id));
    return true;
  }, []);

  const value = useMemo(
    () => ({ meetings, loading, error, refresh, getMeeting, addMeeting, updateMeeting, deleteMeeting }),
    [meetings, loading, error, refresh, getMeeting, addMeeting, updateMeeting, deleteMeeting],
  );

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
}

export function useMeetings() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error('useMeetings must be used within MeetingProvider');
  return ctx;
}
