import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { orderService } from './order.service.js';

/**
 * Order controller.
 */
export const orderController = {
  list: asyncHandler(async (req, res) => {
    const { items, nextCursor, hasMore } = await orderService.listByUser(req.user.id, req.query);
    ok(res, { items, nextCursor, hasMore });
  }),

  get: asyncHandler(async (req, res) =>
    ok(res, await orderService.getOrder(req.user.id, req.params.id))
  ),

  cancel: asyncHandler(async (req, res) =>
    ok(res, await orderService.cancel(req.params.id, { reason: req.body?.reason, changedBy: 'user' }))
  ),
};
