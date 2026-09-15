import { cacheKeys } from './cacheKeys.js';
import { getOrSet, invalidate, getCache } from '../common/cache/index.js';
import { CACHE_TTL } from '../config/performance.js';

/**
 * Store cache.
 */
export const storeCache = {
  get(storeId, compute) {
    return getOrSet(cacheKeys.store(storeId), CACHE_TTL.STORE, compute);
  },

  getNearest(zone, compute) {
    return getOrSet(cacheKeys.nearestStore(zone), CACHE_TTL.STORE, compute);
  },

  getByZone(zone, compute) {
    return getOrSet(cacheKeys.storesByZone(zone), CACHE_TTL.STORE, compute);
  },

  read(storeId) {
    return getCache(cacheKeys.store(storeId));
  },

  invalidate(storeId) {
    return invalidate([
      cacheKeys.store(storeId),
      cacheKeys.storeInventory(storeId),
      cacheKeys.storesByZone('*'),
    ]);
  },
};
