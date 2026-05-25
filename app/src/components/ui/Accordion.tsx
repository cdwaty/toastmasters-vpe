import { ReactNode, useState } from 'react';
import clsx from 'clsx';

interface AccordionProps {
  title: ReactNode;
  trailing?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Accordion({ title, trailing, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-[18px] py-3.5 bg-cream hover:bg-cream-dark font-serif text-base text-ink transition-colors cursor-pointer border-0"
      >
        <span>{title}</span>
        <span className="flex items-center gap-3">
          {trailing}
          <span
            className={clsx(
              'text-[11px] text-ink-light transition-transform duration-200',
              open && 'rotate-180',
            )}
          >
            ▼
          </span>
        </span>
      </button>
      {open && (
        <div className="px-[18px] py-4 border-t border-cream-dark">{children}</div>
      )}
    </div>
  );
}
