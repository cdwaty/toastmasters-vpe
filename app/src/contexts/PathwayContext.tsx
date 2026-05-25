import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';
import type { LevelAward, Pathway, ProjectCompletion } from '../types';
import * as pathwaysApi from '../lib/api/pathways';
import { recordMemberHistory } from '../lib/api/changeHistory';
import { log } from '../lib/logger';
import { useReferenceData } from './ReferenceDataContext';

interface PathwayContextValue {
  pathways: Pathway[];
  completions: ProjectCompletion[];
  awards: LevelAward[];
  loading: boolean;
  error: string | null;
  loadForMember: (memberId: string) => Promise<void>;
  clear: () => void;

  addPathway: (input: Partial<Pathway>) => Promise<Pathway | null>;
  updatePathway: (id: string, patch: Partial<Pathway>) => Promise<Pathway | null>;
  setPrimaryPathway: (pathwayId: string) => Promise<boolean>;
  deletePathway: (id: string) => Promise<boolean>;

  upsertCompletion: (input: Partial<ProjectCompletion>) => Promise<ProjectCompletion | null>;
  deleteCompletion: (id: string) => Promise<boolean>;

  setLevelAwardDate: (pathwayId: string, level: number, awardedDate: string) => Promise<LevelAward | null>;
  removeLevelAward: (id: string) => Promise<boolean>;
}

const PathwayContext = createContext<PathwayContextValue | undefined>(undefined);

export function PathwayProvider({ children }: { children: ReactNode }) {
  const { pathwayTypes } = useReferenceData();
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [completions, setCompletions] = useState<ProjectCompletion[]>([]);
  const [awards, setAwards] = useState<LevelAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const pathwayName = useCallback(
    (pathwayTypeId: string) =>
      pathwayTypes.find(pt => pt.id === pathwayTypeId)?.pathway_name ?? 'Unknown pathway',
    [pathwayTypes],
  );

  const loadForMember = useCallback(async (memberId: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const pathwaysResult = await pathwaysApi.listPathwaysForMember(memberId);
    if (requestId !== requestIdRef.current) return;

    if (!pathwaysResult.ok) {
      setError(pathwaysResult.error.message);
      setLoading(false);
      return;
    }

    if (pathwaysResult.data.length === 0) {
      setPathways([]);
      setCompletions([]);
      setAwards([]);
      setLoading(false);
      return;
    }

    const pathwayIds = pathwaysResult.data.map(p => p.id);
    const [completionsResult, awardsResult] = await Promise.all([
      pathwaysApi.listProjectCompletionsForPathways(pathwayIds),
      pathwaysApi.listLevelAwardsForPathways(pathwayIds),
    ]);

    if (requestId !== requestIdRef.current) return;

    setPathways(pathwaysResult.data);
    setCompletions(completionsResult.ok ? completionsResult.data : []);
    setAwards(awardsResult.ok ? awardsResult.data : []);
    setLoading(false);
  }, []);

  const clear = useCallback(() => {
    requestIdRef.current++;
    setPathways([]);
    setCompletions([]);
    setAwards([]);
    setError(null);
  }, []);

  const addPathway = useCallback(async (input: Partial<Pathway>) => {
    const result = await pathwaysApi.createPathway(input);
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    setPathways(prev => [...prev, result.data]);
    if (result.data.member_id) {
      await recordMemberHistory(result.data.member_id, [
        {
          label: `Pathway assigned: ${pathwayName(result.data.pathway_type_id)}`,
          old_value: null,
          new_value: null,
        },
      ]);
    }
    return result.data;
  }, [pathwayName]);

  const updatePathway = useCallback(async (id: string, patch: Partial<Pathway>) => {
    const result = await pathwaysApi.updatePathway(id, patch);
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    setPathways(prev => prev.map(p => (p.id === id ? result.data : p)));
    return result.data;
  }, []);

  const setPrimaryPathway = useCallback(async (pathwayId: string) => {
    const prevPrimary = pathways.find(p => p.is_primary && p.id !== pathwayId);

    const promote = await pathwaysApi.updatePathway(pathwayId, { is_primary: true });
    if (!promote.ok) {
      setError(promote.error.message);
      return false;
    }

    if (prevPrimary) {
      const demote = await pathwaysApi.updatePathway(prevPrimary.id, { is_primary: false });
      if (!demote.ok) {
        log.warn(
          { pathwayId: prevPrimary.id, newPrimaryId: pathwayId, error: demote.error.message },
          'setPrimaryPathway: failed to demote previous primary — member now has two primary pathways until next save',
        );
        setError(demote.error.message);
        setPathways(prev => prev.map(p => (p.id === pathwayId ? { ...p, is_primary: true } : p)));
        return false;
      }
    }

    setPathways(prev => prev.map(p => ({
      ...p,
      is_primary: p.id === pathwayId,
    })));
    return true;
  }, [pathways]);

  const deletePathway = useCallback(async (id: string) => {
    const target = pathways.find(p => p.id === id);
    const result = await pathwaysApi.deletePathway(id);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    setPathways(prev => prev.filter(p => p.id !== id));
    setCompletions(prev => prev.filter(c => c.pathway_id !== id));
    setAwards(prev => prev.filter(a => a.pathway_id !== id));
    if (target?.member_id) {
      await recordMemberHistory(target.member_id, [
        {
          label: `Pathway removed: ${pathwayName(target.pathway_type_id)}`,
          old_value: null,
          new_value: null,
        },
      ]);
    }
    return true;
  }, [pathways, pathwayName]);

  const upsertCompletion = useCallback(async (input: Partial<ProjectCompletion>) => {
    const result = await pathwaysApi.upsertProjectCompletion(input);
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    setCompletions(prev => {
      const idx = prev.findIndex(c => c.id === result.data.id);
      if (idx === -1) return [...prev, result.data];
      const next = [...prev];
      next[idx] = result.data;
      return next;
    });
    return result.data;
  }, []);

  const deleteCompletion = useCallback(async (id: string) => {
    const result = await pathwaysApi.deleteProjectCompletion(id);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    setCompletions(prev => prev.filter(c => c.id !== id));
    return true;
  }, []);

  const setLevelAwardDate = useCallback(async (pathwayId: string, level: number, awardedDate: string) => {
    const result = await pathwaysApi.setLevelAwardDate(pathwayId, level, awardedDate);
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    setAwards(prev => {
      const idx = prev.findIndex(a => a.id === result.data.id);
      if (idx === -1) return [...prev, result.data];
      const next = [...prev];
      next[idx] = result.data;
      return next;
    });
    return result.data;
  }, []);

  const removeLevelAward = useCallback(async (id: string) => {
    const result = await pathwaysApi.deleteLevelAward(id);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    setAwards(prev => prev.filter(a => a.id !== id));
    return true;
  }, []);

  const value = useMemo(
    () => ({
      pathways, completions, awards, loading, error,
      loadForMember, clear,
      addPathway, updatePathway, setPrimaryPathway, deletePathway,
      upsertCompletion, deleteCompletion,
      setLevelAwardDate, removeLevelAward,
    }),
    [pathways, completions, awards, loading, error, loadForMember, clear, addPathway, updatePathway, setPrimaryPathway, deletePathway, upsertCompletion, deleteCompletion, setLevelAwardDate, removeLevelAward],
  );

  return <PathwayContext.Provider value={value}>{children}</PathwayContext.Provider>;
}

export function usePathways() {
  const ctx = useContext(PathwayContext);
  if (!ctx) throw new Error('usePathways must be used within PathwayProvider');
  return ctx;
}
