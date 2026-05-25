import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const SHIMMER_BASE = [
  'animate-shimmer',
  'bg-gradient-to-r from-cream-dark/40 via-cream-dark/70 to-cream-dark/40',
  'bg-[length:200%_100%]',
].join(' ');

const ROUNDED = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const;

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(SHIMMER_BASE, ROUNDED[rounded], className)}
      style={{ width, height }}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showAvatar?: boolean;
  showHeader?: boolean;
  headerLabels?: string[];
}

export function TableSkeleton({
  rows = 10,
  columns = 6,
  showAvatar = false,
  showHeader = true,
  headerLabels,
}: TableSkeletonProps) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col">
      {showHeader && (
        <div className="flex items-center gap-4 px-5 py-3.5 bg-burgundy text-white text-[11px] uppercase tracking-caps font-semibold">
          {showAvatar && <div className="w-9 shrink-0" />}
          {Array.from({ length: columns }).map((_, colIdx) => {
            const flex = colIdx === 0 ? 'flex-[2]' : 'flex-1';
            const label = headerLabels?.[colIdx];
            return (
              <div key={colIdx} className={flex}>
                {label ?? ''}
              </div>
            );
          })}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 px-5 py-4 border-b border-cream-dark last:border-b-0"
        >
          {showAvatar && <Skeleton width="36px" height="36px" rounded="full" />}
          {Array.from({ length: columns }).map((_, colIdx) => {
            const flex = colIdx === 0 ? 'flex-[2]' : 'flex-1';
            return <Skeleton key={colIdx} height="14px" className={flex} />;
          })}
        </div>
      ))}
    </div>
  );
}

interface StatCardGridSkeletonProps {
  count?: number;
  showDescription?: boolean;
}

export function StatCardGridSkeleton({ count = 4, showDescription = false }: StatCardGridSkeletonProps) {
  return (
    <div role="status" aria-label="Loading stats" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-line rounded-xl px-5 py-4 shadow-soft">
          <Skeleton height="12px" className="w-2/3" />
          <Skeleton height="32px" className="w-16 mt-2" />
          {showDescription && <Skeleton height="10px" className="w-1/2 mt-2" />}
        </div>
      ))}
    </div>
  );
}

interface TableBodySkeletonProps {
  rows?: number;
  columns: number;
  showAvatar?: boolean;
}

export function TableBodySkeleton({ rows = 10, columns, showAvatar = false }: TableBodySkeletonProps) {
  return (
    <tbody role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-cream-dark last:border-b-0">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-3 py-4">
              {colIdx === 0 && showAvatar ? (
                <div className="flex items-center gap-3">
                  <Skeleton width="36px" height="36px" rounded="full" />
                  <Skeleton height="14px" className="flex-1 max-w-[160px]" />
                </div>
              ) : (
                <Skeleton height="14px" className="w-full max-w-[140px]" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

interface CardSkeletonProps {
  lines?: number;
  withAvatar?: boolean;
}

export function CardSkeleton({ lines = 3, withAvatar = false }: CardSkeletonProps) {
  return (
    <div role="status" aria-label="Loading" className="flex items-start gap-4 p-5">
      {withAvatar && <Skeleton width="48px" height="48px" rounded="full" />}
      <div className="flex flex-col gap-2 flex-1">
        {Array.from({ length: lines }).map((_, idx) => (
          <Skeleton
            key={idx}
            height="14px"
            className={idx === 0 ? 'w-1/3' : idx === lines - 1 ? 'w-2/3' : 'w-full'}
          />
        ))}
      </div>
    </div>
  );
}

export function PathwayCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading pathway"
      className="bg-white border border-line rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4 px-[18px] py-3.5 bg-cream">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Skeleton height="22px" className="w-44" />
          <Skeleton height="18px" className="w-16" rounded="full" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton height="11px" className="w-32" />
          <Skeleton height="6px" className="w-[180px]" rounded="full" />
        </div>
      </div>
      <div className="px-[18px] py-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="min-h-[96px] rounded-xl bg-cream/70 flex flex-col items-center justify-center gap-2 px-2 py-3"
            >
              <Skeleton height="22px" width="22px" rounded="full" />
              <Skeleton height="10px" className="w-3/4" />
              <Skeleton height="10px" className="w-1/3" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 pt-2 border-t border-cream-dark">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cream/40 border border-line">
              <Skeleton width="32px" height="32px" rounded="full" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton height="13px" className="w-1/2" />
                <Skeleton height="10px" className="w-1/3" />
              </div>
              <Skeleton width="14px" height="14px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
