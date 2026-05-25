import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useAsync } from '../../hooks/useAsync';
import { listMemberHistory } from '../../lib/api/changeHistory';
import { Spinner } from '../../components/ui';

interface HistoryCardProps {
  memberId: string;
  reloadKey?: number;
}

const PAGE_SIZE = 10;

function formatEntryTimestamp(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = d.toLocaleString(undefined, { month: 'short' });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = String(hours).padStart(2, '0');
  return `${day} ${month} ${year} ${hh}:${minutes} ${period}`;
}

const PAGER_BTN = [
  'w-7 h-7 rounded-md border border-line bg-white text-ink-mid',
  'inline-flex items-center justify-center',
  'enabled:hover:bg-cream enabled:hover:border-ink-light/40 enabled:hover:text-ink',
  'disabled:opacity-40 disabled:cursor-not-allowed',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40',
].join(' ');

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
  </svg>
);

export function HistoryCard({ memberId, reloadKey = 0 }: HistoryCardProps) {
  const { data, loading, error } = useAsync(() => listMemberHistory(memberId), [memberId, reloadKey]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [memberId, reloadKey]);

  const total = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageEntries = useMemo(
    () => data?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ?? [],
    [data, currentPage],
  );

  return (
    <aside className="bg-white border border-line rounded-2xl shadow-soft flex flex-col max-h-[calc(100vh-120px)] sticky top-6">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-2">
        <h3 className="font-serif text-lg text-ink">Change History</h3>
        {total > 0 && (
          <span className="text-xs text-ink-light">{total} {total === 1 ? 'entry' : 'entries'}</span>
        )}
      </div>
      <div className="px-6 flex flex-col gap-2.5 overflow-y-auto flex-1">
        {loading && <Spinner />}
        {error && <p className="text-xs text-danger">{error.message}</p>}
        {!loading && !error && total === 0 && (
          <p className="text-sm text-ink-light">No changes recorded yet.</p>
        )}
        {pageEntries.map(entry => {
          const hasDiff = entry.old_value !== null || entry.new_value !== null;
          return (
            <div
              key={entry.id}
              className="bg-cream rounded-lg border-l-4 border-burgundy/70 pl-3 pr-3 py-2 flex flex-col gap-0.5"
            >
              <div className="text-[11px] text-ink-light tabular-nums whitespace-nowrap">
                {formatEntryTimestamp(entry.timestamp)}
              </div>
              <div className="text-sm text-ink leading-snug">
                {entry.label}
                {hasDiff && (
                  <span className="text-ink-light">
                    {' '}{entry.old_value ?? '—'} → {entry.new_value ?? '—'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-3 mt-3 border-t border-cream-dark flex items-center justify-between text-xs text-ink-mid">
          <span className="tabular-nums">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              className={clsx(PAGER_BTN)}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              className={clsx(PAGER_BTN)}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              <Chevron dir="right" />
            </button>
          </div>
        </div>
      )}
      <div className="pb-2" />
    </aside>
  );
}
