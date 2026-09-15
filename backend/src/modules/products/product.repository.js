import { Product } from './product.model.js';
import { PRODUCT_LIST_PROJECTION, PRODUCT_DETAIL_PROJECTION } from './product.constants.js';

/**
 * Product repository.
 *
 * All queries use explicit projections so we never pull an entire product doc
 * for high-volume endpoints (equivalent of avoiding SELECT *).
 */
export const productRepository = {
  async findById(id, { projection = PRODUCT_DETAIL_PROJECTION } = {}) {
    return Product.findById(id).select(projection).lean();
  },

  async findBySlug(slug) {
    return Product.findOne({ slug }).select(PRODUCT_DETAIL_PROJECTION).lean();
  },

  async findBySku(sku) {
    return Product.findOne({ sku }).select(PRODUCT_DETAIL_PROJECTION).lean();
  },

  /** Fetch many products by id (used to hydrate cart items with pricing). */
  async findManyByIds(ids) {
    return Product.find({ _id: { $in: ids } })
      .select({ name: 1, 'pricing.price': 1, 'pricing.mrp': 1, images: 1, unit: 1, status: 1 })
      .lean();
  },

  /**
   * List products by category with cursor pagination.
   * `runQuery`-style: takes filter, sort, limit and returns lean docs.
   */
  async listByCategory(categoryId, { sort = { popularity: -1 }, limit = 20, filter = {} }) {
    return Product.find({ categoryId, status: 'ACTIVE', ...filter })
      .select(PRODUCT_LIST_PROJECTION)
      .sort(sort)
      .limit(limit)
      .lean();
  },

  async listFeatured({ limit = 20 }) {
    return Product.find({ isFeatured: true, status: 'ACTIVE' })
      .select(PRODUCT_LIST_PROJECTION)
      .sort({ popularity: -1 })
      .limit(limit)
      .lean();
  },

  async listPopular({ limit = 20 }) {
    return Product.find({ status: 'ACTIVE' })
      .select(PRODUCT_LIST_PROJECTION)
      .sort({ popularity: -1 })
      .limit(limit)
      .lean();
  },

  /** Cursor-paginated raw query used by the pagination engine. */
  async queryWithCursor({ filter, sort, limit }) {
    return Product.find(filter)
      .select(PRODUCT_LIST_PROJECTION)
      .sort(sort)
      .limit(limit)
      .lean();
  },

  async create(data) {
    return Product.create(data);
  },

  async update(id, data) {
    return Product.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  },
};
