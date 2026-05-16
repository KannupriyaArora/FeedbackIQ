import Link from 'next/link';

export default function Hero({ demoHref }: { demoHref: string }) {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-20 text-center">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
        Now in beta
      </span>

      <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
        Turn Customer Feedback into{' '}
        <span className="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
          Actionable Insights
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-lg text-slate-400">
        FeedbackIQ uses AI to automatically classify, analyze, and summarize customer feedback —
        so you spend less time reading and more time shipping.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          Get Started Free
        </Link>
        <Link
          href={demoHref}
          className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/40 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          View Demo Report →
        </Link>
      </div>
    </section>
  );
}
