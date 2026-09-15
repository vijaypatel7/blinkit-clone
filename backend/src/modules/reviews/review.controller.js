import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { reviewService } from './review.service.js';

/**
 * Review controller.
 */
export const reviewController = {
  list: asyncHandler(async (req, res) => {
    const { items, nextCursor, hasMore } = await reviewService.listByProduct(req.params.productId, req.query);
    ok(res, { items, nextCursor, hasMore });
  }),

  summary: asyncHandler(async (req, res) =>
    ok(res, await reviewService.getSummary(req.params.productId))
  ),

  create: asyncHandler(async (req, res) =>
    created(res, await reviewService.create(req.user.id, req.body))
  ),
};
