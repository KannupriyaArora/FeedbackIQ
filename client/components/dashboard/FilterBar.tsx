'use client';

import type { SentimentFilter } from '../../types';

const SENTIMENTS: { value: SentimentFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
];

export default function FilterBar({
  sentimentFilter,
  onSentimentChange,
  categoryFilter,
  onCategoryChange,
  categories,
  search,
  onSearchChange,
}: {
  sentimentFilter: SentimentFilter;
  onSentimentChange: (v: SentimentFilter) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  categories: string[];
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-slate-700 bg-slate-900/60 p-1">
        {SENTIMENTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSentimentChange(value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              sentimentFilter === value
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {categories.length > 0 && (
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="cursor-pointer appearance-none rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 outline-none transition hover:border-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search feedback…"
        className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 placeholder-slate-500 outline-none transition hover:border-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}
