import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { makeChain } from '../test/supabaseMock';

vi.mock('./supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from './supabase';
import { useConnectionStatus } from './connectionMonitor';

const from = supabase.from as ReturnType<typeof vi.fn>;

beforeEach(() => {
  from.mockReturnValue(makeChain({ data: null, count: 0, error: null }));
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
});

describe('useConnectionStatus', () => {
  it('starts with navigator.onLine for online state', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    const { result } = renderHook(() => useConnectionStatus());
    expect(result.current.online).toBe(false);
  });

  it('updates online when window emits online/offline events', async () => {
    const { result } = renderHook(() => useConnectionStatus());
    await waitFor(() => expect(result.current.reachable).toBe(true));
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current.online).toBe(false);
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(result.current.online).toBe(true);
  });

  it('reachable is true after a successful ping', async () => {
    const { result } = renderHook(() => useConnectionStatus());
    await waitFor(() => expect(result.current.reachable).toBe(true));
    expect(from).toHaveBeenCalledWith('role_types');
  });

  it('reachable becomes false when ping returns an error', async () => {
    from.mockReturnValue(makeChain({ data: null, error: { message: 'denied' } }));
    const { result } = renderHook(() => useConnectionStatus());
    await waitFor(() => expect(result.current.reachable).toBe(false));
  });

  it('removes window event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useConnectionStatus());
    unmount();
    const events = removeSpy.mock.calls.map(c => c[0]);
    expect(events).toContain('online');
    expect(events).toContain('offline');
  });
});
