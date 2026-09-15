import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { checkoutService } from './checkout.service.js';

/**
 * Checkout controller.
 */
export const checkoutController = {
  quote: asyncHandler(async (req, res) =>
    ok(res, await checkoutService.quote(req.user.id, req.body))
  ),

  checkout: asyncHandler(async (req, res) =>
    created(res, await checkoutService.checkout(req.user.id, req.body))
  ),
};
