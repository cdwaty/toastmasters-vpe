import { useEffect, useState } from 'react';
import { config } from '../lib/config';

export function useDebounce<T>(value: T, delay = config.input.debounceMs): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
