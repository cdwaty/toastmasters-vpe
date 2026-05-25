import { ReactNode, useEffect, useId, useRef } from 'react';
import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'max-w-[420px] w-full',
  md: 'max-w-[560px] w-full',
  lg: 'max-w-[720px] w-full',
  xl: 'max-w-[900px] w-full',
} as const;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: keyof typeof SIZE_CLASSES;
  footer?: ReactNode;
  children: ReactNode;
}

export function Modal({ open, onClose, title, description, size = 'md', footer, children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirst = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? panel).focus();
    };
    focusFirst();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(el => !el.hasAttribute('disabled'));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-ink/50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={clsx(
          'flex flex-col bg-white rounded-2xl shadow-pop max-h-[90vh] overflow-hidden animate-pop outline-none',
          SIZE_CLASSES[size],
        )}
        onClick={e => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="px-6 pt-5 pb-2">
            {title && <h2 id={titleId} className="font-serif text-xl text-ink">{title}</h2>}
            {description && <p className="text-[13px] text-ink-light mt-1">{description}</p>}
          </div>
        )}
        <div className="px-6 py-4 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-6 py-3.5 border-t border-cream-dark">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
