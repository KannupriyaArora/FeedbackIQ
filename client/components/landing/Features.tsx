import { LinkIcon, SparklesIcon, UploadIcon } from './Icons';

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition hover:border-slate-700">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section className="border-t border-slate-800 py-24">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Everything you need to listen better
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Built for product teams who care about what their users actually say.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard
          icon={<SparklesIcon />}
          title="AI-Powered Analysis"
          description="An LLM classifies sentiment and categorizes every entry automatically — no manual tagging required."
        />
        <FeatureCard
          icon={<UploadIcon />}
          title="CSV Batch Upload"
          description="Drop in a spreadsheet and analyze hundreds of feedback entries at once. Perfect for survey exports."
        />
        <FeatureCard
          icon={<LinkIcon />}
          title="Shareable Reports"
          description="Generate a public report link in one click. Share with stakeholders — no login required."
        />
      </div>
    </section>
  );
}
