'use client';

import { memo, useEffect, useState } from 'react';
import CategoryBar from './charts/CategoryBar';
import SentimentPie from './charts/SentimentPie';
import type { StatsResponse } from '../types';

function ChartPlaceholder() {
  return <div className="h-[220px] animate-pulse rounded-xl bg-slate-800/60" />;
}

function ChartsSection({
  stats,
  loading,
}: {
  stats: StatsResponse | null;
  loading: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (loading) {
    return (
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="mb-5 h-4 w-36 animate-pulse rounded bg-slate-800/60" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ChartPlaceholder />
          <ChartPlaceholder />
        </div>
      </div>
    );
  }

  if (!stats || stats.total === 0) return null;

  return (
    <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="mb-5 text-sm font-semibold text-white">Insights Overview</h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {mounted ? <SentimentPie stats={stats} /> : <ChartPlaceholder />}
        {mounted && stats.topCategories.length > 0 ? (
          <CategoryBar stats={stats} />
        ) : (
          <ChartPlaceholder />
        )}
      </div>
    </div>
  );
}

export default memo(ChartsSection);
