'use client';

import Link from 'next/link';
import Button from '../Button';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center sm:py-20">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-2xl ring-1 ring-indigo-400/30">
        💬
      </div>
      <p className="text-sm font-medium text-white">No feedback yet</p>
      <p className="mt-1 text-sm text-slate-400">
        Submit your first entry and it will appear here.
      </p>
      <Link href="/submit" className="mt-5">
        <Button variant="primary">Submit Feedback</Button>
      </Link>
    </div>
  );
}

export function FilterEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center">
      <p className="text-sm font-medium text-white">No entries match your filters</p>
      <p className="mt-1 text-sm text-slate-400">Try adjusting the sentiment or category filter.</p>
      <button
        onClick={onReset}
        className="mt-4 text-xs font-medium text-indigo-300 underline underline-offset-2 transition hover:text-indigo-200"
      >
        Clear filters
      </button>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-16 rounded-full bg-slate-800/60" />
        <div className="h-5 w-20 rounded-full bg-slate-800/60" />
        <div className="h-5 w-14 rounded-full bg-slate-800/60" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-slate-800/60" />
        <div className="h-3.5 w-4/5 rounded bg-slate-800/60" />
      </div>
      <div className="mt-3 h-3 w-3/4 rounded bg-slate-800/60" />
      <div className="mt-4 h-3 w-24 rounded bg-slate-800/60" />
    </div>
  );
}
