import { BadRequestError, NotFoundError } from '../../common/errors/AppError.js';
import { reviewRepository } from './review.repository.js';
import { productRepository } from '../products/product.repository.js';
import { toReviewResponse } from './review.mapper.js';
import { productModuleCache } from '../products/product.cache.js';

/**
 * Review service.
 */
export const reviewService = {
  async listByProduct(productId, { limit, cursor } = {}) {
    const { items, nextCursor, hasMore } = await reviewRepository.listByProduct(productId, { limit, cursor });
    return { items: items.map(toReviewResponse), nextCursor, hasMore };
  },

  async getSummary(productId) {
    const agg = await reviewRepository.aggregate(productId);
    return {
      productId,
      avgRating: Math.round(agg.avgRating * 10) / 10,
      reviewCount: agg.count,
    };
  },

  async create(userId, data) {
    const product = await productRepository.findById(data.productId);
    if (!product) throw new NotFoundError('Product not found');

    const existing = await reviewRepository.findUserReview(userId, data.productId);
    if (existing) throw new BadRequestError('You already reviewed this product');

    const review = await reviewRepository.create({ ...data, userId });
    // Invalidate cached product rating.
    await productModuleCache.invalidate(data.productId);
    return toReviewResponse(review);
  },
};
