'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getStats, listFeedback } from './api';
import { useDebouncedValue } from './useDebouncedValue';
import type { Feedback, SentimentFilter, StatsResponse } from '../types';

export interface UseFeedbackReturn {
  items: Feedback[];
  stats: StatsResponse | null;
  loading: boolean;
  statsLoading: boolean;
  error: string;
  categories: string[];
  filtered: Feedback[];
  sentimentFilter: SentimentFilter;
  setSentimentFilter: (v: SentimentFilter) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

/**
 * Owns all feedback fetching, filtering, and derived-state logic for the
 * dashboard. The dashboard page consumes this hook and stays free of network
 * and filter-computation concerns.
 *
 * The search input is debounced 300ms so typing doesn't re-filter on every
 * keystroke; sentiment/category controls remain instant.
 */
export function useFeedback(): UseFeedbackReturn {
  const { user, isLoaded } = useUser();
  const [items, setItems] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const userId = user.id;

    listFeedback(userId)
      .then(setItems)
      .catch(() => setError('Could not load feedback. Is the server running?'))
      .finally(() => setLoading(false));

    getStats(userId)
      .then(setStats)
      .catch(() => null)
      .finally(() => setStatsLoading(false));
  }, [isLoaded, user]);

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c)))].sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return items.filter((item) => {
      if (sentimentFilter !== 'all' && item.sentiment !== sentimentFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (q) {
        const haystack = `${item.rawText} ${item.summary ?? ''} ${item.category ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, sentimentFilter, categoryFilter, debouncedSearch]);

  const hasActiveFilters =
    sentimentFilter !== 'all' || categoryFilter !== 'all' || debouncedSearch.trim() !== '';

  const resetFilters = useCallback(() => {
    setSentimentFilter('all');
    setCategoryFilter('all');
    setSearch('');
  }, []);

  return {
    items,
    stats,
    loading,
    statsLoading,
    error,
    categories,
    filtered,
    sentimentFilter,
    setSentimentFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    hasActiveFilters,
    resetFilters,
  };
}
