import { storage } from './storage.js';

/**
 * Client-side request cache.
 *
 * In-memory TTL cache for GET responses, so rapid navigation (e.g. back/forward
 * on the home page) doesn't re-fetch. Works alongside the server's Redis cache
 * and RTK Query's built-in caching.
 */
const cache = new Map();

const DEFAULT_TTL_MS = 30 * 1000;

export const requestCache = {
  get(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    return entry.value;
  },

  set(key, value, ttlMs = DEFAULT_TTL_MS) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  /** Memoize an async fn by key with TTL. */
  async memo(key, fn, ttlMs) {
    const hit = this.get(key);
    if (hit !== null) return hit;
    const value = await fn();
    this.set(key, value, ttlMs);
    return value;
  },

  clear() {
    cache.clear();
  },
};

/** Persist a small "recent searches" list (survives reloads). */
export const recentSearches = {
  KEY: 'blinkit.recentSearches',
  list() {
    return storage.get(this.KEY, []);
  },
  add(term) {
    const current = this.list().filter((t) => t !== term);
    current.unshift(term);
    storage.set(this.KEY, current.slice(0, 10));
  },
  clear() {
    storage.remove(this.KEY);
  },
};
