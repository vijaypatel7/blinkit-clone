import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { cartService } from './cart.service.js';

/**
 * Cart controller.
 */
export const cartController = {
  get: asyncHandler(async (req, res) => ok(res, await cartService.getCart(req.user.id))),

  addItem: asyncHandler(async (req, res) =>
    ok(res, await cartService.addItem(req.user.id, req.body))
  ),

  updateQuantity: asyncHandler(async (req, res) =>
    ok(res, await cartService.updateQuantity(req.user.id, req.params.productId, req.body.quantity))
  ),

  removeItem: asyncHandler(async (req, res) =>
    ok(res, await cartService.removeItem(req.user.id, req.params.productId))
  ),

  clear: asyncHandler(async (req, res) => ok(res, await cartService.clear(req.user.id))),
};
