'use client';

import { useState } from 'react';
import Button from '../Button';

export default function ReportModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Report ready!</h2>
            <p className="mt-0.5 text-sm text-slate-400">Share this link with anyone.</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5">
          <p className="flex-1 truncate font-mono text-xs text-slate-300">{url}</p>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/10 hover:text-indigo-200"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" className="text-xs">
              View Report →
            </Button>
          </a>
          <Button variant="secondary" className="text-xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
