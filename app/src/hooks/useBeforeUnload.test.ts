import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBeforeUnload } from './useBeforeUnload';

let addSpy: ReturnType<typeof vi.spyOn>;
let removeSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  addSpy = vi.spyOn(window, 'addEventListener');
  removeSpy = vi.spyOn(window, 'removeEventListener');
});

afterEach(() => {
  addSpy.mockRestore();
  removeSpy.mockRestore();
});

describe('useBeforeUnload', () => {
  it('attaches no listener when disabled', () => {
    renderHook(() => useBeforeUnload(false));
    expect(addSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('attaches a listener when enabled', () => {
    renderHook(() => useBeforeUnload(true));
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('removes the listener on unmount', () => {
    const { unmount } = renderHook(() => useBeforeUnload(true));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('handler calls preventDefault and sets returnValue', () => {
    renderHook(() => useBeforeUnload(true));
    const call = addSpy.mock.calls.find((c: unknown[]) => c[0] === 'beforeunload');
    const handler = call?.[1] as (e: BeforeUnloadEvent) => void;
    const event = { preventDefault: vi.fn(), returnValue: 'unset' } as unknown as BeforeUnloadEvent;
    handler(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe('');
  });

  it('re-attaches when enabled flips from false to true', () => {
    const { rerender } = renderHook(({ on }) => useBeforeUnload(on), {
      initialProps: { on: false },
    });
    expect(addSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
    rerender({ on: true });
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});
