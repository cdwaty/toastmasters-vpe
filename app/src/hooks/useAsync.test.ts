import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsync } from './useAsync';
import { ok, err } from '../lib/result';

describe('useAsync', () => {
  it('starts loading and resolves to data on success', async () => {
    const fetcher = vi.fn().mockResolvedValue(ok('hello'));
    const { result } = renderHook(() => useAsync(fetcher, []));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('hello');
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetcher returns err', async () => {
    const fetcher = vi.fn().mockResolvedValue(err(new Error('boom')));
    const { result } = renderHook(() => useAsync(fetcher, []));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.data).toBeNull();
  });

  it('re-runs when deps change', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(ok('first'))
      .mockResolvedValueOnce(ok('second'));
    const { result, rerender } = renderHook(({ dep }) => useAsync(fetcher, [dep]), {
      initialProps: { dep: 1 },
    });

    await waitFor(() => expect(result.current.data).toBe('first'));
    rerender({ dep: 2 });
    await waitFor(() => expect(result.current.data).toBe('second'));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('reload() refetches and updates data', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(ok('first'))
      .mockResolvedValueOnce(ok('reloaded'));
    const { result } = renderHook(() => useAsync(fetcher, []));

    await waitFor(() => expect(result.current.data).toBe('first'));
    await act(async () => { await result.current.reload(); });
    expect(result.current.data).toBe('reloaded');
  });

  it('setData overrides current data', async () => {
    const fetcher = vi.fn().mockResolvedValue(ok('orig'));
    const { result } = renderHook(() => useAsync<string>(fetcher, []));
    await waitFor(() => expect(result.current.data).toBe('orig'));
    act(() => { result.current.setData('manual'); });
    expect(result.current.data).toBe('manual');
  });

  it('ignores a stale resolve after a newer reload', async () => {
    let resolveFirst: ((v: ReturnType<typeof ok<string>>) => void) | null = null;
    const fetcher = vi.fn()
      .mockImplementationOnce(() => new Promise(res => { resolveFirst = res; }))
      .mockResolvedValueOnce(ok('second'));

    const { result } = renderHook(() => useAsync(fetcher, []));

    await act(async () => { await result.current.reload(); });
    expect(result.current.data).toBe('second');

    await act(async () => {
      resolveFirst?.(ok('first-late'));
      await Promise.resolve();
    });
    expect(result.current.data).toBe('second');
  });
});
