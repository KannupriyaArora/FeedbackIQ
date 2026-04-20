'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Button from '../../components/Button';
import ChartsSection from '../../components/ChartsSection';

interface Feedback {
  _id: string;
  rawText: string;
  source: 'manual' | 'csv';
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  category: string | null;
  summary: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  topCategories: { category: string; count: number }[];
  averageConfidence: number;
}

type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const SOURCE_LABEL: Record<string, string> = { manual: 'Manual', csv: 'CSV' };
const SOURCE_STYLE: Record<string, string> = {
  manual: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  csv: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
};
const SENTIMENT_STYLE: Record<string, string> = {
  positive: 'bg-green-50 text-green-700 ring-1 ring-green-100',
  negative: 'bg-red-50 text-red-700 ring-1 ring-red-100',
  neutral: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};
const SENTIMENT_LABEL: Record<string, string> = {
  positive: 'Positive',
  negative: 'Negative',
  neutral: 'Neutral',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function pct(part: number, total: number): string {
  if (total === 0) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

// ── Stat cards ────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-gray-400">{label}</p>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="h-7 w-16 rounded bg-gray-100" />
      <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
    </div>
  );
}

function StatsBar({ stats, loading }: { stats: Stats | null; loading: boolean }) {
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

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-5 w-20 rounded-full bg-gray-100" />
        <div className="h-5 w-14 rounded-full bg-gray-100" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-gray-100" />
        <div className="h-3.5 w-4/5 rounded bg-gray-100" />
      </div>
      <div className="mt-3 h-3 w-3/4 rounded bg-gray-100" />
      <div className="mt-4 h-3 w-24 rounded bg-gray-100" />
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
        💬
      </div>
      <p className="text-sm font-medium text-gray-900">No feedback yet</p>
      <p className="mt-1 text-sm text-gray-400">Submit your first entry and it will appear here.</p>
      <Link href="/submit" className="mt-5">
        <Button variant="primary">Submit Feedback</Button>
      </Link>
    </div>
  );
}

function FilterEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
      <p className="text-sm font-medium text-gray-900">No entries match your filters</p>
      <p className="mt-1 text-sm text-gray-400">Try adjusting the sentiment or category filter.</p>
      <button
        onClick={onReset}
        className="mt-4 text-xs font-medium text-violet-600 underline underline-offset-2 hover:text-violet-700"
      >
        Clear filters
      </button>
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({
  sentimentFilter,
  onSentimentChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: {
  sentimentFilter: SentimentFilter;
  onSentimentChange: (v: SentimentFilter) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  categories: string[];
}) {
  const sentiments: { value: SentimentFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'positive', label: 'Positive' },
    { value: 'negative', label: 'Negative' },
    { value: 'neutral', label: 'Neutral' },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        {sentiments.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSentimentChange(value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              sentimentFilter === value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {categories.length > 0 && (
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// ── Feedback card ─────────────────────────────────────────────────────────────
function FeedbackCard({ item }: { item: Feedback }) {
  const preview =
    item.rawText.length > 120 ? item.rawText.slice(0, 120).trimEnd() + '…' : item.rawText;

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {item.sentiment ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SENTIMENT_STYLE[item.sentiment]}`}
          >
            {SENTIMENT_LABEL[item.sentiment]}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
            Pending
          </span>
        )}
        {item.category && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
            {item.category}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_STYLE[item.source]}`}
        >
          {SOURCE_LABEL[item.source]}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-gray-800">{preview}</p>

      {item.summary && (
        <p className="mt-2 text-xs italic leading-relaxed text-gray-400">{item.summary}</p>
      )}

      <p className="mt-auto pt-4 text-xs text-gray-400">{formatDate(item.createdAt)}</p>
    </div>
  );
}

// ── Report modal ──────────────────────────────────────────────────────────────
function ReportModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Report ready!</h2>
            <p className="mt-0.5 text-sm text-gray-500">Share this link with anyone.</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
          <p className="flex-1 truncate font-mono text-xs text-gray-700">{url}</p>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-violet-600 transition hover:bg-violet-50"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" className="text-xs">
              View Report →
            </Button>
          </a>
          <Button variant="secondary" className="text-xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/feedback`)
      .then((res) => {
        if (!res.ok) throw new Error('Server error');
        return res.json() as Promise<Feedback[]>;
      })
      .then(setItems)
      .catch(() => setError('Could not load feedback. Is the server running?'))
      .finally(() => setLoading(false));

    fetch(`${API_URL}/api/feedback/stats`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<Stats>;
      })
      .then(setStats)
      .catch(() => null)
      .finally(() => setStatsLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c)))].sort(),
    [items]
  );

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (sentimentFilter !== 'all' && item.sentiment !== sentimentFilter) return false;
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
        return true;
      }),
    [items, sentimentFilter, categoryFilter]
  );

  const hasActiveFilters = sentimentFilter !== 'all' || categoryFilter !== 'all';

  function resetFilters() {
    setSentimentFilter('all');
    setCategoryFilter('all');
  }

  async function generateReport() {
    setGenerating(true);
    setGenerateError('');
    try {
      const title = `Feedback Report — ${new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`;
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, feedbackIds: filtered.map((i) => i._id) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGenerateError(body.errors?.[0]?.msg ?? body.error ?? 'Failed to generate report.');
        return;
      }
      setReportUrl(`${window.location.origin}/report/${body.slug}`);
    } catch {
      setGenerateError('Network error. Please try again.');
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
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Your Insights</h1>
            <p className="mt-1 text-sm text-gray-500">{subtitleText}</p>
          </div>
          <div className="flex items-center gap-2">
            {filtered.length > 0 && (
              <Button variant="outline" onClick={generateReport} disabled={generating}>
                {generating ? 'Generating…' : 'Generate Report'}
              </Button>
            )}
            <Link href="/submit">
              <Button variant="primary">+ Add Feedback</Button>
            </Link>
          </div>
        </div>

        {/* Generate report error */}
        {generateError && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {generateError}
          </div>
        )}

        {/* Stats bar */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Charts */}
        <ChartsSection stats={stats} loading={statsLoading} />

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* No data */}
        {!loading && !error && items.length === 0 && <EmptyState />}

        {/* Filter bar + grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <FilterBar
              sentimentFilter={sentimentFilter}
              onSentimentChange={setSentimentFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              categories={categories}
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
          </>
        )}
      </main>

      {reportUrl && <ReportModal url={reportUrl} onClose={() => setReportUrl(null)} />}
    </>
  );
}
