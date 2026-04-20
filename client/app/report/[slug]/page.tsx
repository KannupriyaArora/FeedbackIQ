'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FeedbackEntry {
  _id: string;
  rawText: string;
  source: 'manual' | 'csv';
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  category: string | null;
  summary: string | null;
  createdAt: string;
}

interface ReportStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  topCategories: { category: string; count: number }[];
  averageConfidence: number;
}

interface Report {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
  entries: FeedbackEntry[];
  stats: ReportStats;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
const SOURCE_STYLE: Record<string, string> = {
  manual: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  csv: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
};
const SOURCE_LABEL: Record<string, string> = { manual: 'Manual', csv: 'CSV' };

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function pct(part: number, total: number): string {
  if (total === 0) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-gray-400">{label}</p>
    </div>
  );
}

function EntryCard({ item }: { item: FeedbackEntry }) {
  const preview =
    item.rawText.length > 120 ? item.rawText.slice(0, 120).trimEnd() + '…' : item.rawText;

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
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

export default function ReportPage({ params }: { params: { slug: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/reports/${params.slug}`)
      .then((res) => {
        if (res.status === 404) throw new Error('not_found');
        if (!res.ok) throw new Error('server_error');
        return res.json() as Promise<Report>;
      })
      .then(setReport)
      .catch((err: Error) => {
        setError(
          err.message === 'not_found'
            ? 'This report does not exist or has been removed.'
            : 'Failed to load the report. Please try again.'
        );
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 animate-pulse space-y-3">
          <div className="h-7 w-64 rounded bg-gray-100" />
          <div className="h-4 w-40 rounded bg-gray-100" />
        </div>
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-5">
              <div className="h-7 w-16 rounded bg-gray-100" />
              <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
        <Link href="/" className="mt-4 inline-block text-sm text-violet-600 hover:underline">
          ← Back to home
        </Link>
      </main>
    );
  }

  if (!report) return null;

  const topCat = report.stats.topCategories[0]?.category ?? '—';

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      {/* Report header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-violet-500">
          Shared Report
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{report.title}</h1>
        <p className="mt-1 text-sm text-gray-400">
          {formatDate(report.createdAt)} · {report.stats.total}{' '}
          {report.stats.total === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {/* Stats summary */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={String(report.stats.total)} label="Total Entries" />
        <StatCard value={pct(report.stats.positive, report.stats.total)} label="Positive" />
        <StatCard value={pct(report.stats.negative, report.stats.total)} label="Negative" />
        <StatCard value={topCat} label="Top Category" />
      </div>

      {/* Entries */}
      <div className="mb-4 text-sm font-medium text-gray-700">Feedback Entries</div>
      <div className="grid gap-4 sm:grid-cols-2">
        {report.entries.map((entry) => (
          <EntryCard key={entry._id} item={entry} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-100 pt-6 text-center">
        <p className="text-xs text-gray-400">
          Generated with{' '}
          <Link href="/" className="text-violet-500 hover:underline">
            FeedbackIQ
          </Link>
        </p>
      </div>
    </main>
  );
}
