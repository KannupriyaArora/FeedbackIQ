'use client';

import Link from 'next/link';
import Button from '../Button';
import FeedbackCard from '../FeedbackCard';
import type { Feedback } from '../../types';

export type SubmitResultStatus = 'analyzing' | 'success';

export default function SubmitResult({
  entry,
  status,
  onDismiss,
}: {
  entry: Feedback;
  status: SubmitResultStatus;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {status === 'analyzing' ? (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
            Analyzing your feedback…
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Submitted successfully
          </>
        )}
      </div>

      <FeedbackCard item={entry} optimistic={status === 'analyzing'} />

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard">
          <Button variant="outline" className="px-3 py-1 text-xs">
            View Dashboard
          </Button>
        </Link>
        <Button variant="secondary" className="px-3 py-1 text-xs" onClick={onDismiss}>
          Submit Another
        </Button>
      </div>
    </div>
  );
}
