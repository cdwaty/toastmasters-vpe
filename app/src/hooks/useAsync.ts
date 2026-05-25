import { useCallback, useEffect, useRef, useState } from 'react';
import type { Result } from '../lib/result';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  reload: () => Promise<void>;
  setData: (data: T | null) => void;
}

export function useAsync<T>(
  fetcher: () => Promise<Result<T>>,
  deps: ReadonlyArray<unknown>,
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    const result = await fetcherRef.current();
    if (!mountedRef.current || requestId !== requestIdRef.current) return;
    if (result.ok) {
      setState({ data: result.data, loading: false, error: null });
    } else {
      setState(s => ({ ...s, loading: false, error: result.error }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    reload();
    return () => {
      mountedRef.current = false;
      requestIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((data: T | null) => {
    setState(s => ({ ...s, data }));
  }, []);

  return { ...state, reload, setData };
}
