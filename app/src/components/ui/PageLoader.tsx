import { Skeleton, StatCardGridSkeleton, TableSkeleton } from './Skeleton';

type PageLoaderVariant = 'full' | 'route' | 'minimal';

interface PageLoaderProps {
  variant?: PageLoaderVariant;
  showStats?: boolean;
  showFilters?: boolean;
  showTable?: boolean;
  rows?: number;
  columns?: number;
}

export function PageLoader({
  variant = 'route',
  showStats = true,
  showFilters = true,
  showTable = true,
  rows = 8,
  columns = 7,
}: PageLoaderProps) {
  if (variant === 'minimal') {
    return (
      <div role="status" aria-label="Loading" className="flex items-center justify-center p-10">
        <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
      </div>
    );
  }

  const content = (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-2">
          <Skeleton height="28px" className="w-64" />
          <Skeleton height="14px" className="w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton height="38px" className="w-28" rounded="lg" />
          <Skeleton height="38px" className="w-32" rounded="lg" />
        </div>
      </div>
      {showStats && <StatCardGridSkeleton count={4} showDescription />}
      {showTable && (
        <div className="bg-white border border-line rounded-2xl shadow-soft overflow-hidden">
          {showFilters && (
            <div className="p-5 flex flex-wrap items-center gap-3 border-b border-cream-dark">
              <Skeleton height="38px" className="flex-1 min-w-[240px]" rounded="lg" />
              <Skeleton height="38px" className="w-44" rounded="lg" />
              <Skeleton height="38px" className="w-44" rounded="lg" />
              <Skeleton height="38px" className="w-36" rounded="lg" />
              <Skeleton height="20px" className="w-28" />
            </div>
          )}
          <TableSkeleton rows={rows} columns={columns} showAvatar />
        </div>
      )}
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="h-16 bg-burgundy-dark/95" />
        <div className="flex-1 p-8 max-md:p-5" role="status" aria-label="Loading">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading">
      {content}
    </div>
  );
}
