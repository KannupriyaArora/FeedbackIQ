import StatCard, { SkeletonStatCard } from '../StatCard';
import { pct } from '../../lib/format';
import type { StatsResponse } from '../../types';

export default function StatsBar({
  stats,
  loading,
}: {
  stats: StatsResponse | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );
  }
  if (!stats || stats.total === 0) return null;

  const topCat = stats.topCategories[0]?.category ?? '—';

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard value={String(stats.total)} label="Total Feedback" />
      <StatCard value={pct(stats.positive, stats.total)} label="Positive" />
      <StatCard value={pct(stats.negative, stats.total)} label="Negative" />
      <StatCard value={topCat} label="Top Category" />
    </div>
  );
}
