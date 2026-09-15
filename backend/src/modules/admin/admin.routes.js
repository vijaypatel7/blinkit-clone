import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { adminController } from './admin.controller.js';
import { listAuditLogsQuerySchema, updateOrderStatusSchema } from './admin.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Admin routes — every route requires the ADMIN role (already authenticated by
 * the parent router).
 */
export const adminRoutes = Router();

adminRoutes.use(authorize(ROLES.ADMIN));

adminRoutes.get('/dashboard', adminController.dashboard);
adminRoutes.get('/audit-logs', validateRequest({ query: listAuditLogsQuerySchema }), adminController.auditLogs);

adminRoutes.patch(
  '/orders/:id/status',
  validateRequest({ params: idParamSchema, body: updateOrderStatusSchema }),
  adminController.updateOrderStatus
);
adminRoutes.get('/stores/:storeId/orders', adminController.storeOrders);

adminRoutes.patch('/products/:id', validateRequest({ params: idParamSchema }), adminController.updateProduct);
adminRoutes.patch('/stores/:id', validateRequest({ params: idParamSchema }), adminController.updateStore);
adminRoutes.post('/inventory/adjust', adminController.adjustInventory);
