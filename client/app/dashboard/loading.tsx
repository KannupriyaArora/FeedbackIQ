export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-800/60" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-800/60" />
        </div>
        <div className="h-9 w-36 animate-pulse rounded-md bg-slate-800/60" />
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

      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="mb-5 h-4 w-36 animate-pulse rounded bg-slate-800/60" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-[220px] animate-pulse rounded-xl bg-slate-800/60" />
          <div className="h-[220px] animate-pulse rounded-xl bg-slate-800/60" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/40 p-5"
          >
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
        ))}
      </div>
    </main>
  );
}
