import { GitHubIcon } from './Icons';

export default function Footer({ githubUrl }: { githubUrl: string }) {
  return (
    <footer className="border-t border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm font-semibold tracking-tight text-white">FeedbackIQ</p>
        <p className="text-xs text-slate-500">Built with Next.js + Groq</p>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-white"
        >
          <GitHubIcon />
          GitHub
        </a>
      </div>
    </footer>
  );
}
