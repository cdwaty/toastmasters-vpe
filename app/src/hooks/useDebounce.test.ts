import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounce', () => {
  it('returns the initial value synchronously', () => {
    const { result } = renderHook(() => useDebounce('initial', 250));
    expect(result.current).toBe('initial');
  });

  it('updates after the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 250), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(250); });
    expect(result.current).toBe('b');
  });

  it('cancels pending update when value changes again before delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 250), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ v: 'c' });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(150); });
    expect(result.current).toBe('c');
  });

  it('uses default delay of 250ms', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => { vi.advanceTimersByTime(249); });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('b');
  });
});
