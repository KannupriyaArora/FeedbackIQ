import type { FeedbackSource, Sentiment } from '../types';

export const SENTIMENT_STYLE: Record<Sentiment, string> = {
  positive: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
  negative: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
  neutral: 'bg-slate-700/40 text-slate-300 ring-1 ring-slate-600/40',
};

export const SENTIMENT_LABEL: Record<Sentiment, string> = {
  positive: 'Positive',
  negative: 'Negative',
  neutral: 'Neutral',
};

export const SOURCE_STYLE: Record<FeedbackSource, string> = {
  manual: 'bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20',
  csv: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
};

export const SOURCE_LABEL: Record<FeedbackSource, string> = {
  manual: 'Manual',
  csv: 'CSV',
};
