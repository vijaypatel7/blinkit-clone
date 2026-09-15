import { searchRepository } from './search.repository.js';
import { toSearchProductResult, toSearchCategoryResult, toSuggestion } from './search.mapper.js';
import { getOrSet } from '../../common/cache/index.js';
import { cacheKeys } from '../../cache/cacheKeys.js';
import { CACHE_TTL } from '../../config/performance.js';
import { hashQuery } from '../products/product.cache.js';

/**
 * Search service.
 *
 * Search results are cached for a short window to absorb bursts of identical
 * queries (common on a marketplace home page).
 */
export const searchService = {
  async search({ q, type = 'all', limit = 20 }) {
    const queryHash = hashQuery({ q, type, limit });
    return getOrSet(cacheKeys.search(queryHash), CACHE_TTL.SEARCH, async () => {
      const results = { products: [], categories: [] };

      if (type === 'all' || type === 'products') {
        const products = await searchRepository.searchProducts(q, { limit });
        results.products = products.map(toSearchProductResult);
      }
      if (type === 'all' || type === 'categories') {
        const categories = await searchRepository.searchCategories(q, { limit: 8 });
        results.categories = categories.map(toSearchCategoryResult);
      }
      return results;
    });
  },

  async suggest(q, { limit = 8 } = {}) {
    const queryHash = hashQuery({ suggest: q, limit });
    return getOrSet(cacheKeys.search(`suggest:${queryHash}`), CACHE_TTL.SEARCH, async () => {
      const suggestions = await searchRepository.suggest(q, { limit });
      return suggestions.map(toSuggestion);
    });
  },
};
