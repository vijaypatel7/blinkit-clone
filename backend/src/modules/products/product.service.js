import { NotFoundError } from '../../common/errors/AppError.js';
import { productRepository } from './product.repository.js';
import { productModuleCache, hashQuery } from './product.cache.js';
import { toProductListItem, toProductDetail } from './product.mapper.js';
import { paginateWithCursor } from '../../common/pagination/index.js';
import { PRODUCT_SORT } from './product.constants.js';

/**
 * Product service.
 *
 * Listing flow (per the architecture):
 *   validate params → build cache key → check Redis → return hit, else query
 *   MongoDB → write Redis → return. This removes the bulk of DB load.
 */
const SORT_MAP = {
  [PRODUCT_SORT.POPULARITY]: { popularity: -1, _id: -1 },
  [PRODUCT_SORT.PRICE_ASC]: { 'pricing.price': 1, _id: 1 },
  [PRODUCT_SORT.PRICE_DESC]: { 'pricing.price': -1, _id: -1 },
  [PRODUCT_SORT.NEWEST]: { createdAt: -1, _id: -1 },
};

export const productService = {
  async getDetail(productId) {
    const product = await productModuleCache.getDetail(productId, () =>
      productRepository.findById(productId)
    );
    if (!product) throw new NotFoundError('Product not found');
    return toProductDetail(product);
  },

  async getBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new NotFoundError('Product not found');
    return toProductDetail(product);
  },

  /**
   * Cursor-paginated product listing with Redis cache.
   */
  async list({ categoryId, brand, sort, featured, cursor, limit = 20 }) {
    const sortKey = sort || PRODUCT_SORT.POPULARITY;
    const queryHash = hashQuery({ categoryId, brand, sortKey, featured, cursor, limit });

    return productModuleCache.getList(queryHash, () => this._queryList({
      categoryId,
      brand,
      sortKey,
      featured,
      cursor,
      limit,
    }));
  },

  /** Internal: the actual DB query behind the cache. */
  async _queryList({ categoryId, brand, sortKey, featured, cursor, limit }) {
    const sortField = Object.keys(SORT_MAP[sortKey])[0];
    const sortDirection = SORT_MAP[sortKey][sortField] === 1 ? 'asc' : 'desc';

    const filter = { status: 'ACTIVE' };
    if (categoryId) filter.categoryId = categoryId;
    if (brand) filter.brand = brand;
    if (featured) filter.isFeatured = true;

    const { items, nextCursor } = await paginateWithCursor({
      query: filter,
      sortField,
      sortDirection,
      limit,
      cursor,
      runQuery: (f, s, l) =>
        productRepository.queryWithCursor({
          filter: f,
          sort: { ...s, _id: sortDirection === 'desc' ? -1 : 1 },
          limit: l,
        }),
    });

    return {
      items: items.map(toProductListItem),
      nextCursor,
      hasMore: nextCursor != null,
    };
  },

  async listPopular(zone, { limit = 20 } = {}) {
    const popular = await productModuleCache.getPopular(zone, () =>
      productRepository.listPopular({ limit })
    );
    return popular.map(toProductListItem);
  },

  // ------------------------------------------------------------------
  // Admin
  // ------------------------------------------------------------------
  async create(data) {
    const { mrp, price, slug, ...rest } = data;
    const product = await productRepository.create({
      ...rest,
      slug: slug || data.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      pricing: { mrp, price, currency: 'INR' },
    });
    await productModuleCache.invalidate(product._id);
    return toProductDetail(product);
  },

  async update(productId, data) {
    const { mrp, price, ...rest } = data;
    const pricing = mrp != null || price != null
      ? { ...(mrp != null && { mrp }), ...(price != null && { price }) }
      : undefined;
    const product = await productRepository.update(productId, { ...rest, ...(pricing && { pricing }) });
    if (!product) throw new NotFoundError('Product not found');
    await productModuleCache.invalidate(productId);
    return toProductDetail(product);
  },
};
