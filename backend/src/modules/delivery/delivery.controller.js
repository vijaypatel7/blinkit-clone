import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { deliveryService } from './delivery.service.js';

/**
 * Delivery controller.
 */
export const deliveryController = {
  get: asyncHandler(async (req, res) =>
    ok(res, await deliveryService.getWithTracking(req.params.orderId))
  ),

  track: asyncHandler(async (req, res) => {
    const { coordinates } = req.body;
    ok(res, await deliveryService.appendTrackingPoint(req.params.deliveryId, { coordinates }));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const { status, coordinates } = req.body;
    ok(res, await deliveryService.updateStatus(req.params.orderId, status, { coordinates }));
  }),
};
