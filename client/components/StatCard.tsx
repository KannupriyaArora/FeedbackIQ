export default function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
      <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="h-7 w-16 rounded bg-slate-800/60" />
      <div className="mt-2 h-3 w-24 rounded bg-slate-800/60" />
    </div>
  );
}
