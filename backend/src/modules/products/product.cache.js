import { createHash } from 'node:crypto';
import { cacheKeys } from '../../cache/cacheKeys.js';
import { getOrSet, setCache, invalidate } from '../../common/cache/index.js';
import { CACHE_TTL } from '../../config/performance.js';

/**
 * Product module cache (thin wrapper over the generic cache helpers).
 *
 * Product listings are keyed by a stable hash of the query so any combination
 * of filters/sort/pagination has its own cache entry.
 */
export const hashQuery = (obj) => {
  const json = JSON.stringify(obj ?? {});
  return createHash('sha1').update(json).digest('hex').slice(0, 16);
};

export const productModuleCache = {
  getDetail(productId, compute) {
    return getOrSet(cacheKeys.product(productId), CACHE_TTL.PRODUCT, compute);
  },

  getList(queryHash, compute) {
    return getOrSet(cacheKeys.productList(queryHash), CACHE_TTL.PRODUCT_LIST, compute);
  },

  getPopular(zone, compute) {
    return getOrSet(cacheKeys.popularProducts(zone), CACHE_TTL.POPULAR, compute);
  },

  setList(queryHash, value) {
    return setCache(cacheKeys.productList(queryHash), value, CACHE_TTL.PRODUCT_LIST);
  },

  invalidate(productId) {
    return invalidate([
      cacheKeys.product(productId),
      `product:${productId}:store:*`,
      cacheKeys.productList('*'),
      cacheKeys.popularProducts('*'),
    ]);
  },
};
