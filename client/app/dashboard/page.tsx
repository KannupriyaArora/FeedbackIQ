'use client';

import { useState } from 'react';
import ChartsSection from '../../components/ChartsSection';
import ErrorBoundary from '../../components/ErrorBoundary';
import FeedbackCard from '../../components/FeedbackCard';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsBar from '../../components/dashboard/StatsBar';
import FilterBar from '../../components/dashboard/FilterBar';
import { EmptyState, FilterEmptyState, SkeletonCard } from '../../components/dashboard/EmptyStates';
import ReportModal from '../../components/dashboard/ReportModal';
import { ApiError, createReport } from '../../lib/api';
import { useFeedback } from '../../lib/useFeedback';

export default function DashboardPage() {
  const {
    items,
    stats,
    loading,
    statsLoading,
    error,
    categories,
    filtered,
    sentimentFilter,
    setSentimentFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    hasActiveFilters,
    resetFilters,
  } = useFeedback();

  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  async function generateReport() {
    setGenerating(true);
    setGenerateError('');
    try {
      const title = `Feedback Report — ${new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`;
      const { slug } = await createReport({ title, feedbackIds: filtered.map((i) => i._id) });
      setReportUrl(`${window.location.origin}/report/${slug}`);
    } catch (err) {
      setGenerateError(err instanceof ApiError ? err.message : 'Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  const subtitleText = loading
    ? 'Loading feedback…'
    : error
      ? ''
      : hasActiveFilters
        ? `${filtered.length} of ${items.length} ${items.length === 1 ? 'entry' : 'entries'}`
        : `${items.length} ${items.length === 1 ? 'entry' : 'entries'}`;

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <DashboardHeader
          subtitle={subtitleText}
          showGenerate={filtered.length > 0}
          generating={generating}
          onGenerate={generateReport}
        />

        {generateError && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {generateError}
          </div>
        )}

        <StatsBar stats={stats} loading={statsLoading} />

        <ErrorBoundary
          fallback={
            <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
              Could not render charts. Refresh to try again.
            </div>
          }
        >
          <ChartsSection stats={stats} loading={statsLoading} />
        </ErrorBoundary>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && <EmptyState />}

        {!loading && !error && items.length > 0 && (
          <ErrorBoundary
            fallback={
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
                Could not render feedback list. Refresh to try again.
              </div>
            }
          >
            <FilterBar
              sentimentFilter={sentimentFilter}
              onSentimentChange={setSentimentFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              categories={categories}
              search={search}
              onSearchChange={setSearch}
            />
            {filtered.length === 0 ? (
              <FilterEmptyState onReset={resetFilters} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((item) => (
                  <FeedbackCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </ErrorBoundary>
        )}
      </main>

      {reportUrl && <ReportModal url={reportUrl} onClose={() => setReportUrl(null)} />}
    </>
  );
}
