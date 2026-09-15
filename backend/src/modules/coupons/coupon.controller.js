import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { couponService } from './coupon.service.js';

/**
 * Coupon controller.
 */
export const couponController = {
  list: asyncHandler(async (_req, res) => ok(res, await couponService.list())),
  create: asyncHandler(async (req, res) => created(res, await couponService.create(req.body))),
  update: asyncHandler(async (req, res) => ok(res, await couponService.update(req.params.id, req.body))),
};
