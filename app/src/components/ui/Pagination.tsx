import clsx from 'clsx';
import { ReactNode } from 'react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  itemLabel?: string;
  hideWhenSinglePage?: boolean;
  className?: string;
}

const PAGE_BTN_BASE = [
  'min-w-9 h-9 px-2.5 rounded-md border text-sm font-medium',
  'inline-flex items-center justify-center',
  'transition-colors',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40',
].join(' ');

const PAGE_BTN_INACTIVE = 'bg-white border-line text-ink-mid enabled:hover:bg-cream enabled:hover:text-ink enabled:hover:border-ink-light/40';
const PAGE_BTN_ACTIVE = 'bg-burgundy border-burgundy text-white';

const ChevronLeft = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronDoubleLeft = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="11 18 5 12 11 6" />
    <polyline points="18 18 12 12 18 6" />
  </svg>
);
const ChevronDoubleRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="13 18 19 12 13 6" />
    <polyline points="6 18 12 12 6 6" />
  </svg>
);

interface NavButtonProps {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  children: ReactNode;
}

function NavButton({ onClick, disabled, ariaLabel, children }: NavButtonProps) {
  return (
    <button
      type="button"
      className={clsx(PAGE_BTN_BASE, PAGE_BTN_INACTIVE)}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

function buildPageNumbers(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const result: (number | '…')[] = [1];
  if (page > 3) result.push('…');
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);
  for (let i = from; i <= to; i++) result.push(i);
  if (page < totalPages - 2) result.push('…');
  result.push(totalPages);
  return result;
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  itemLabel,
  hideWhenSinglePage = true,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (hideWhenSinglePage && totalPages <= 1) return null;

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const pages = buildPageNumbers(page, totalPages);

  const summary = total === 0
    ? 'No results'
    : itemLabel
      ? `Showing ${start}–${end} of ${total} ${total === 1 ? itemLabel : `${itemLabel}s`}`
      : `Showing ${start}–${end} of ${total}`;

  const goTo = (target: number) => {
    const clamped = Math.max(1, Math.min(totalPages, target));
    if (clamped !== page) onChange(clamped);
  };

  return (
    <nav
      aria-label="Pagination"
      className={clsx(
        'flex items-center justify-between gap-3 flex-wrap px-[18px] py-3.5 border-t border-cream-dark text-[13px] text-ink-mid',
        className,
      )}
    >
      <span>{summary}</span>
      <div className="flex gap-1.5">
        <NavButton onClick={() => goTo(1)} disabled={page === 1} ariaLabel="First page">
          <ChevronDoubleLeft />
        </NavButton>
        <NavButton onClick={() => goTo(page - 1)} disabled={page === 1} ariaLabel="Previous page">
          <ChevronLeft />
        </NavButton>
        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`gap-${i}`}
              className={clsx(PAGE_BTN_BASE, PAGE_BTN_INACTIVE, 'opacity-50 cursor-default')}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={clsx(PAGE_BTN_BASE, p === page ? PAGE_BTN_ACTIVE : PAGE_BTN_INACTIVE)}
              onClick={() => goTo(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          ),
        )}
        <NavButton onClick={() => goTo(page + 1)} disabled={page >= totalPages} ariaLabel="Next page">
          <ChevronRight />
        </NavButton>
        <NavButton onClick={() => goTo(totalPages)} disabled={page >= totalPages} ariaLabel="Last page">
          <ChevronDoubleRight />
        </NavButton>
      </div>
    </nav>
  );
}
