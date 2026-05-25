import { KeyboardEvent, ReactNode, useRef } from 'react';
import clsx from 'clsx';

interface TabItem {
  key: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  children?: ReactNode;
  ariaLabel?: string;
}

const TAB_BASE = [
  'px-[18px] py-3 text-sm font-medium transition-colors -mb-px',
  'bg-transparent border-0 border-b-2 border-transparent cursor-pointer font-sans',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 rounded-t',
].join(' ');

export function Tabs({ items, active, onChange, children, ariaLabel = 'Tabs' }: TabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentKey: string) => {
    const currentIndex = items.findIndex(item => item.key === currentKey);
    if (currentIndex < 0) return;
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextKey = items[nextIndex].key;
    onChange(nextKey);
    refs.current[nextKey]?.focus();
  };

  return (
    <div>
      <div className="flex gap-1 px-1 border-b border-cream-dark" role="tablist" aria-label={ariaLabel}>
        {items.map(item => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              ref={el => { refs.current[item.key] = el; }}
              type="button"
              role="tab"
              id={`tab-${item.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.key}`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={e => handleKeyDown(e, item.key)}
              className={clsx(
                TAB_BASE,
                isActive
                  ? 'text-burgundy border-b-burgundy'
                  : 'text-ink-light hover:text-ink-mid',
              )}
              onClick={() => onChange(item.key)}
            >
              <span className="inline-flex items-center gap-2">
                {item.icon}
                {item.label}
                {item.count !== undefined && (
                  <span className="text-ink-light">({item.count})</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {children && (
        <div
          className="py-5 px-1"
          role="tabpanel"
          id={`tabpanel-${active}`}
          aria-labelledby={`tab-${active}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
