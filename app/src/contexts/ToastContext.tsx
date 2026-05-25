import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { config } from '../lib/config';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  notify: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const KIND_CLASSES: Record<ToastKind, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-info text-white',
};

const KIND_ICON: Record<ToastKind, string> = {
  success: '✓',
  error: '⚠',
  info: 'ℹ',
};

const TOAST_TTL_MS = config.toast.ttlMs;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    let reusedId: number | null = null;
    setToasts(prev => {
      const existing = prev.find(t => t.message === message && t.kind === kind);
      if (existing) {
        reusedId = existing.id;
        return prev;
      }
      const id = nextIdRef.current++;
      reusedId = id;
      return [...prev, { id, kind, message }];
    });

    if (reusedId !== null) {
      const existingTimer = timersRef.current.get(reusedId);
      if (existingTimer) clearTimeout(existingTimer);
      const id = reusedId;
      const timer = setTimeout(() => dismiss(id), TOAST_TTL_MS);
      timersRef.current.set(id, timer);
    }
  }, [dismiss]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-20 right-5 z-[300] flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            aria-live={t.kind === 'error' ? 'assertive' : 'polite'}
            className={`flex items-center gap-2.5 px-[18px] py-3 rounded-[10px] text-sm font-medium shadow-pop max-w-sm animate-slideIn ${KIND_CLASSES[t.kind]}`}
          >
            <span aria-hidden="true">{KIND_ICON[t.kind]}</span>
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="ml-2 -mr-1 flex h-5 w-5 items-center justify-center rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
