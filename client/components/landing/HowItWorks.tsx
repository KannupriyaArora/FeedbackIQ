import Link from 'next/link';
import { ChartIcon, CpuIcon, PencilIcon } from './Icons';

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/10 text-xs font-semibold text-indigo-300">
          {number}
        </span>
        <span className="text-indigo-400">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </li>
  );
}

export default function HowItWorks() {
  return (
    <section className="border-t border-slate-800 py-24">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
        <p className="mt-3 text-sm text-slate-400">
          From raw feedback to insight in three steps.
        </p>
      </div>

      <ol className="grid gap-6 md:grid-cols-3">
        <Step
          number={1}
          icon={<PencilIcon />}
          title="Submit feedback"
          description="Paste a single entry, or batch-upload a CSV with hundreds of rows."
        />
        <Step
          number={2}
          icon={<CpuIcon />}
          title="AI analyzes instantly"
          description="Sentiment, category, and a one-line summary generated for every entry."
        />
        <Step
          number={3}
          icon={<ChartIcon />}
          title="View and share"
          description="Filter your insights on the dashboard, then share a public report with a link."
        />
      </ol>

      <div className="mt-14 flex justify-center">
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
        >
          Start collecting insights →
        </Link>
      </div>
    </section>
  );
}
