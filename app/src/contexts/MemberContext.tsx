import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import type { Member } from '../types';
import { useAuth } from './AuthContext';
import * as membersApi from '../lib/api/members';
import { recordMemberHistory } from '../lib/api/changeHistory';
import { diffMember } from '../lib/api/memberDiff';
import { log } from '../lib/logger';

interface MemberContextValue {
  members: Member[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getMember: (id: string) => Member | undefined;
  addMember: (input: Partial<Member>) => Promise<Member | null>;
  updateMember: (id: string, patch: Partial<Member>) => Promise<Member | null>;
  deleteMember: (id: string) => Promise<boolean>;
  bulkUpdate: (ids: string[], patch: Partial<Member>) => Promise<boolean>;
}

const MemberContext = createContext<MemberContextValue | undefined>(undefined);

export function MemberProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshIdRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!session) return;
    const requestId = ++refreshIdRef.current;
    setLoading(true);
    setError(null);
    const result = await membersApi.listMembers();
    if (requestId !== refreshIdRef.current) return;
    if (result.ok) setMembers(result.data);
    else setError(result.error.message);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) refresh();
    else setMembers([]);
  }, [session, refresh]);

  const getMember = useCallback((id: string) => members.find(m => m.id === id), [members]);

  const addMember = useCallback(async (input: Partial<Member>) => {
    const result = await membersApi.createMember(input);
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    setMembers(prev => [...prev, result.data].sort((a, b) => a.full_name.localeCompare(b.full_name)));
    await recordMemberHistory(result.data.id, [
      { label: 'Member added to roster', old_value: null, new_value: null },
    ]);
    return result.data;
  }, []);

  const updateMember = useCallback(async (id: string, patch: Partial<Member>) => {
    const previous = members.find(m => m.id === id);
    const result = await membersApi.updateMember(id, patch);
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    setMembers(prev => prev.map(m => (m.id === id ? result.data : m)));
    if (previous) {
      const entries = diffMember(previous, patch);
      if (entries.length > 0) {
        await recordMemberHistory(id, entries);
      }
    }
    return result.data;
  }, [members]);

  const deleteMember = useCallback(async (id: string) => {
    const result = await membersApi.deleteMember(id);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    return true;
  }, []);

  const bulkUpdate = useCallback(async (ids: string[], patch: Partial<Member>) => {
    const previousById = new Map(members.filter(m => ids.includes(m.id)).map(m => [m.id, m]));
    const result = await membersApi.bulkUpdateMembers(ids, patch);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    const historyWrites = ids
      .map(id => {
        const previous = previousById.get(id);
        if (!previous) return null;
        const entries = diffMember(previous, patch);
        if (entries.length === 0) return null;
        return recordMemberHistory(id, entries).then(result => ({ id, result }));
      })
      .filter((p): p is Promise<{ id: string; result: Awaited<ReturnType<typeof recordMemberHistory>> }> => p !== null);

    const settled = await Promise.allSettled(historyWrites);
    const failures = settled.filter(s => s.status === 'rejected' || (s.status === 'fulfilled' && !s.value.result.ok));
    if (failures.length > 0) {
      log.warn(
        { failed: failures.length, total: historyWrites.length, memberIds: ids },
        'bulkUpdate: some change-history writes failed',
      );
    }
    await refresh();
    return true;
  }, [refresh, members]);

  const value = useMemo(
    () => ({ members, loading, error, refresh, getMember, addMember, updateMember, deleteMember, bulkUpdate }),
    [members, loading, error, refresh, getMember, addMember, updateMember, deleteMember, bulkUpdate],
  );

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMembers() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error('useMembers must be used within MemberProvider');
  return ctx;
}
