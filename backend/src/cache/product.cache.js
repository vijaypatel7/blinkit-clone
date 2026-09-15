import { cacheKeys } from './cacheKeys.js';
import { getOrSet, invalidate, getCache, setCache } from '../common/cache/index.js';
import { CACHE_TTL } from '../config/performance.js';

/**
 * Product cache.
 *
 * Wraps the generic cache helper with product-specific keys and TTLs so
 * services never deal with raw keys directly.
 */
export const productCache = {
  /** Get a single product detail (or compute + cache on miss). */
  getDetail(productId, compute) {
    return getOrSet(cacheKeys.product(productId), CACHE_TTL.PRODUCT, compute);
  },

  /** Get a product as available at a specific store. */
  getAtStore(productId, storeId, compute) {
    return getOrSet(cacheKeys.productAtStore(productId, storeId), CACHE_TTL.PRODUCT, compute);
  },

  /** Get a cached product detail directly (no compute). */
  readDetail(productId) {
    return getCache(cacheKeys.product(productId));
  },

  /** Invalidate a product and all its store-scoped variants. */
  invalidate(productId) {
    return invalidate([
      cacheKeys.product(productId),
      `product:${productId}:store:*`,
      cacheKeys.productList('*'),
    ]);
  },
};
