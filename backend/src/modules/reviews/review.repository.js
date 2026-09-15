import mongoose from 'mongoose';
import { Review } from './review.model.js';

/**
 * Review repository.
 */
export const reviewRepository = {
  async listByProduct(productId, { limit = 20, cursor } = {}) {
    const filter = { productId, status: 'PUBLISHED' };
    if (cursor) {
      const d = new Date(cursor);
      if (!Number.isNaN(d.getTime())) filter.createdAt = { $lt: d };
    }
    const items = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    return {
      items: page,
      nextCursor: hasMore ? page[page.length - 1].createdAt.toISOString() : null,
      hasMore,
    };
  },

  async create(data) {
    return Review.create(data);
  },

  async findUserReview(userId, productId) {
    return Review.findOne({ userId, productId });
  },

  async aggregate(productId) {
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'PUBLISHED' } },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);
    return result[0] || { avgRating: 0, count: 0 };
  },
};
