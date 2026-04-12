'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '../../components/Button';

interface Feedback {
  _id: string;
  rawText: string;
  source: 'manual' | 'csv';
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const SOURCE_LABEL: Record<string, string> = { manual: 'Manual', csv: 'CSV' };
const SOURCE_STYLE: Record<string, string> = {
  manual: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  csv: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-5 w-24 rounded-full bg-gray-100" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-gray-100" />
        <div className="h-3.5 w-4/5 rounded bg-gray-100" />
      </div>
      <div className="mt-4 h-3 w-24 rounded bg-gray-100" />
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
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

// ── Feedback card ────────────────────────────────────────────────────────────
function FeedbackCard({ item }: { item: Feedback }) {
  const preview =
    item.rawText.length > 100 ? item.rawText.slice(0, 100).trimEnd() + '…' : item.rawText;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-gray-200">
      {/* Badges row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_STYLE[item.source]}`}
        >
          {SOURCE_LABEL[item.source]}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
          Pending Analysis
        </span>
      </div>

      {/* Text preview */}
      <p className="text-sm leading-relaxed text-gray-800">{preview}</p>

      {/* Footer */}
      <p className="mt-4 text-xs text-gray-400">{formatDate(item.createdAt)}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/feedback`)
      .then((res) => {
        if (!res.ok) throw new Error('Server error');
        return res.json() as Promise<Feedback[]>;
      })
      .then(setItems)
      .catch(() => setError('Could not load feedback. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Your Insights</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading
              ? 'Loading feedback…'
              : error
                ? ''
                : `${items.length} ${items.length === 1 ? 'entry' : 'entries'}`}
          </p>
        </div>
        <Link href="/submit">
          <Button variant="primary">+ Add Feedback</Button>
        </Link>
      </div>

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

      {/* Empty state */}
      {!loading && !error && items.length === 0 && <EmptyState />}

      {/* Card grid */}
      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <FeedbackCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
