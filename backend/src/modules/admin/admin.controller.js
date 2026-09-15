import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { adminService } from './admin.service.js';

/**
 * Admin controller.
 */
export const adminController = {
  dashboard: asyncHandler(async (_req, res) => ok(res, await adminService.dashboard())),

  updateOrderStatus: asyncHandler(async (req, res) =>
    ok(res, await adminService.updateOrderStatus(req.user, req.params.id, req.body))
  ),

  storeOrders: asyncHandler(async (req, res) =>
    ok(res, await adminService.listStoreOrders(req.params.storeId, req.query))
  ),

  updateProduct: asyncHandler(async (req, res) =>
    ok(res, await adminService.updateProduct(req.user, req.params.id, req.body))
  ),

  adjustInventory: asyncHandler(async (req, res) =>
    ok(res, await adminService.adjustInventory(req.user, req.body))
  ),

  updateStore: asyncHandler(async (req, res) =>
    ok(res, await adminService.updateStore(req.user, req.params.id, req.body))
  ),

  auditLogs: asyncHandler(async (req, res) => {
    const { items, nextCursor, hasMore } = await adminService.listAuditLogs(req.query);
    ok(res, { items, nextCursor, hasMore });
  }),
};
