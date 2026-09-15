import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { inventoryService } from './inventory.service.js';

/**
 * Inventory controller.
 */
export const inventoryController = {
  check: asyncHandler(async (req, res) => {
    const { storeId, productId } = req.query;
    ok(res, await inventoryService.checkAvailability(storeId, productId));
  }),

  forStore: asyncHandler(async (req, res) =>
    ok(res, await inventoryService.getForStore(req.params.storeId))
  ),

  reserve: asyncHandler(async (req, res) =>
    ok(res, await inventoryService.reserve(req.body))
  ),

  restock: asyncHandler(async (req, res) =>
    ok(res, await inventoryService.restock(req.body))
  ),
};
