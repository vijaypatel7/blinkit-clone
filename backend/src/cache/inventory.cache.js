import { cacheKeys } from './cacheKeys.js';
import { getOrSet, invalidate, getCache, setCache } from '../common/cache/index.js';
import { CACHE_TTL } from '../config/performance.js';

/**
 * Inventory cache.
 *
 * Inventory availability has a VERY short TTL (seconds) because it must not
 * drift from the source of truth for long — otherwise we'd show stale
 * "in stock" and cause failed checkouts.
 */
export const inventoryCache = {
  get(storeId, productId, compute) {
    return getOrSet(cacheKeys.inventory(storeId, productId), CACHE_TTL.INVENTORY, compute);
  },

  read(storeId, productId) {
    return getCache(cacheKeys.inventory(storeId, productId));
  },

  /** Called right after a reservation/release so the cache reflects reality. */
  set(storeId, productId, value) {
    return setCache(cacheKeys.inventory(storeId, productId), value, CACHE_TTL.INVENTORY);
  },

  invalidate(storeId, productId) {
    return invalidate([
      cacheKeys.inventory(storeId, productId),
      cacheKeys.storeInventory(storeId),
    ]);
  },
};
