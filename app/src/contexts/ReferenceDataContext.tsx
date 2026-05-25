import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { PathwayTypeWithStructure, RoleType } from '../types';
import { useAuth } from './AuthContext';

interface ReferenceDataContextValue {
  roleTypes: RoleType[];
  pathwayTypes: PathwayTypeWithStructure[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const ReferenceDataContext = createContext<ReferenceDataContextValue | undefined>(undefined);

export function ReferenceDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [pathwayTypes, setPathwayTypes] = useState<PathwayTypeWithStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reloadIdRef = useRef(0);

  const reload = useCallback(async () => {
    if (!session) return;
    const requestId = ++reloadIdRef.current;
    setLoading(true);
    setError(null);

    const [rolesResp, pathwaysResp] = await Promise.all([
      supabase.from('role_types').select('*').eq('is_active', true).order('sort_order'),
      supabase
        .from('pathway_types')
        .select('*, pathway_levels(*, pathway_projects(*))')
        .eq('is_active', true)
        .order('sort_order'),
    ]);

    if (requestId !== reloadIdRef.current) return;

    if (rolesResp.error) {
      setError(rolesResp.error.message);
    } else {
      setRoleTypes((rolesResp.data ?? []) as RoleType[]);
    }

    if (pathwaysResp.error) {
      const message = pathwaysResp.error.message;
      setError(prev => prev ?? message);
    } else {
      const list = (pathwaysResp.data ?? []) as PathwayTypeWithStructure[];
      list.forEach(pt => {
        pt.pathway_levels?.sort((a, b) => a.level_number - b.level_number);
        pt.pathway_levels?.forEach(l => l.pathway_projects?.sort((a, b) => a.sort_order - b.sort_order));
      });
      setPathwayTypes(list);
    }

    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) reload();
  }, [session, reload]);

  const value = useMemo(
    () => ({ roleTypes, pathwayTypes, loading, error, reload }),
    [roleTypes, pathwayTypes, loading, error, reload],
  );

  return <ReferenceDataContext.Provider value={value}>{children}</ReferenceDataContext.Provider>;
}

export function useReferenceData() {
  const ctx = useContext(ReferenceDataContext);
  if (!ctx) throw new Error('useReferenceData must be used within ReferenceDataProvider');
  return ctx;
}
