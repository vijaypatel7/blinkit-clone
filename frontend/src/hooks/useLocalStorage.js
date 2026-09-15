import { useEffect, useState } from 'react';
import { storage } from '../services/storage.js';

/**
 * useState synced to localStorage.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => storage.get(key, initialValue));

  useEffect(() => {
    storage.set(key, value);
  }, [key, value]);

  return [value, setValue];
}
