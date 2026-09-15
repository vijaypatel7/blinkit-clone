import { Product } from '../products/product.model.js';
import { Category } from '../categories/category.model.js';
import { PRODUCT_LIST_PROJECTION } from '../products/product.constants.js';

/**
 * Search repository.
 *
 * Uses MongoDB text/regex search. In a full production deployment you would
 * swap this for Elasticsearch/OpenSearch via the same interface — the service
 * layer is isolated from the implementation.
 */
export const searchRepository = {
  /** Full-text / regex product search with a bounded limit. */
  async searchProducts(term, { limit = 20 } = {}) {
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return Product.find({
      status: 'ACTIVE',
      $or: [
        { name: { $regex: safeTerm, $options: 'i' } },
        { brand: { $regex: safeTerm, $options: 'i' } },
        { sku: { $regex: safeTerm, $options: 'i' } },
      ],
    })
      .select(PRODUCT_LIST_PROJECTION)
      .sort({ popularity: -1 })
      .limit(limit)
      .lean();
  },

  /** Category search. */
  async searchCategories(term, { limit = 8 } = {}) {
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return Category.find({ status: 'ACTIVE', name: { $regex: safeTerm, $options: 'i' } })
      .limit(limit)
      .lean();
  },

  /** Lightweight autocomplete (name + sku only). */
  async suggest(term, { limit = 8 } = {}) {
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return Product.find({ status: 'ACTIVE', name: { $regex: safeTerm, $options: 'i' } })
      .select({ name: 1, sku: 1, brand: 1 })
      .limit(limit)
      .lean();
  },
};
