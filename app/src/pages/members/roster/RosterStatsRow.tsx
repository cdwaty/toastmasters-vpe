import { StatCard, StatCardGridSkeleton } from '../../../components/ui';

interface RosterStats {
  active: number;
  internal: number;
  external: number;
  inactive: number;
}

interface RosterStatsRowProps {
  stats: RosterStats;
  loading: boolean;
}

export function RosterStatsRow({ stats, loading }: RosterStatsRowProps) {
  if (loading) return <StatCardGridSkeleton count={4} showDescription />;
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Active members" value={stats.active} description="No exit date set" variant="success" />
      <StatCard label="Internal" value={stats.internal} description="Company employees" variant="info" />
      <StatCard label="External" value={stats.external} description="Outside members" variant="warning" />
      <StatCard label="Inactive" value={stats.inactive} description="Exit date recorded" />
    </div>
  );
}
