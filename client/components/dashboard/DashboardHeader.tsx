'use client';

import Link from 'next/link';
import Button from '../Button';

export default function DashboardHeader({
  subtitle,
  showGenerate,
  generating,
  onGenerate,
}: {
  subtitle: string;
  showGenerate: boolean;
  generating: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Your Insights
        </h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        {showGenerate && (
          <Button variant="outline" onClick={onGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate Report'}
          </Button>
        )}
        <Link href="/submit">
          <Button variant="primary">+ Add Feedback</Button>
        </Link>
      </div>
    </div>
  );
}
