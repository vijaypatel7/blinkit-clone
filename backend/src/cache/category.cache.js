import { cacheKeys } from './cacheKeys.js';
import { getOrSet, invalidate, getCache } from '../common/cache/index.js';
import { CACHE_TTL } from '../config/performance.js';

/**
 * Category cache.
 */
export const categoryCache = {
  getTree(compute) {
    return getOrSet(cacheKeys.categoryTree(), CACHE_TTL.CATEGORY, compute);
  },

  get(categoryId, compute) {
    return getOrSet(cacheKeys.category(categoryId), CACHE_TTL.CATEGORY, compute);
  },

  getByParent(parentId, compute) {
    return getOrSet(cacheKeys.categoriesByParent(parentId), CACHE_TTL.CATEGORY, compute);
  },

  readTree() {
    return getCache(cacheKeys.categoryTree());
  },

  invalidate(categoryId) {
    return invalidate([
      cacheKeys.category(categoryId),
      cacheKeys.categoryTree(),
      cacheKeys.categoriesByParent('*'),
    ]);
  },
};
