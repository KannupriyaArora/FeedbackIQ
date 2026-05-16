import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates `delay` ms after the
 * last change. Useful for filtering on a fast-typing input without re-running
 * expensive work on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
