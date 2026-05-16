'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FeedbackCard from '../../../components/FeedbackCard';
import StatCard from '../../../components/StatCard';
import { ApiError, getReport } from '../../../lib/api';
import { formatDateLong, pct } from '../../../lib/format';
import type { Report } from '../../../types';

function LoadingSkeleton() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 animate-pulse space-y-3">
        <div className="h-7 w-64 rounded bg-slate-800/60" />
        <div className="h-4 w-40 rounded bg-slate-800/60" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/40 p-5"
          >
            <div className="h-7 w-16 rounded bg-slate-800/60" />
            <div className="mt-2 h-3 w-24 rounded bg-slate-800/60" />
          </div>
        ))}
      </div>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {message}
      </div>
      <Link
        href="/"
        className="mt-4 inline-block text-sm text-indigo-300 transition hover:text-indigo-200 hover:underline"
      >
        ← Back to home
      </Link>
    </main>
  );
}

export default function ReportPage({ params }: { params: { slug: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getReport(params.slug)
      .then(setReport)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setError('This report does not exist or has been removed.');
        } else {
          setError('Failed to load the report. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!report) return null;

  const topCat = report.stats.topCategories[0]?.category ?? '—';
  const entries = report.entries.filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-indigo-300">
          Shared Report
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {report.title}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {formatDateLong(report.createdAt)} · {report.stats.total}{' '}
          {report.stats.total === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={String(report.stats.total)} label="Total Entries" />
        <StatCard value={pct(report.stats.positive, report.stats.total)} label="Positive" />
        <StatCard value={pct(report.stats.negative, report.stats.total)} label="Negative" />
        <StatCard value={topCat} label="Top Category" />
      </div>

      <div className="mb-4 text-sm font-medium text-slate-300">Feedback Entries</div>
      <div className="grid gap-4 sm:grid-cols-2">
        {entries.map((entry) => (
          <FeedbackCard key={entry._id} item={entry} />
        ))}
      </div>

      <div className="mt-12 border-t border-slate-800 pt-6 text-center">
        <p className="text-xs text-slate-500">
          Generated with{' '}
          <Link
            href="/"
            className="text-indigo-300 transition hover:text-indigo-200 hover:underline"
          >
            FeedbackIQ
          </Link>
        </p>
      </div>
    </main>
  );
}
