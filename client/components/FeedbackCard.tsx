import { formatDate } from '../lib/format';
import { SENTIMENT_LABEL, SENTIMENT_STYLE, SOURCE_LABEL, SOURCE_STYLE } from '../lib/styles';
import type { Feedback } from '../types';

export default function FeedbackCard({
  item,
  optimistic = false,
}: {
  item: Feedback;
  optimistic?: boolean;
}) {
  const preview =
    item.rawText.length > 120 ? item.rawText.slice(0, 120).trimEnd() + '…' : item.rawText;

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-600 hover:bg-slate-900/60">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {item.sentiment ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SENTIMENT_STYLE[item.sentiment]}`}
          >
            {SENTIMENT_LABEL[item.sentiment]}
          </span>
        ) : optimistic ? (
          <span className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-indigo-400/30">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
            Analyzing…
          </span>
        ) : (
          <span className="rounded-full bg-slate-700/40 px-2.5 py-0.5 text-xs font-medium text-slate-400 ring-1 ring-slate-600/40">
            Pending
          </span>
        )}
        {item.category && (
          <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-indigo-400/30">
            {item.category}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_STYLE[item.source]}`}
        >
          {SOURCE_LABEL[item.source]}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-slate-100">{preview}</p>

      {item.summary && (
        <p className="mt-2 text-xs italic leading-relaxed text-slate-500">{item.summary}</p>
      )}

      <p className="mt-auto pt-4 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
    </div>
  );
}
