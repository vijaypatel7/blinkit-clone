import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { inventoryController } from './inventory.controller.js';
import { checkAvailabilitySchema, reserveSchema, restockSchema } from './inventory.validation.js';

/**
 * Inventory routes.
 * Availability is public; reserve/restock are protected.
 */
export const inventoryRoutes = Router();

inventoryRoutes.get(
  '/availability',
  validateRequest({ query: checkAvailabilitySchema }),
  inventoryController.check
);

inventoryRoutes.get(
  '/store/:storeId',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.STORE_MANAGER),
  inventoryController.forStore
);

inventoryRoutes.post(
  '/reserve',
  authenticate,
  validateRequest({ body: reserveSchema }),
  inventoryController.reserve
);

inventoryRoutes.post(
  '/restock',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.STORE_MANAGER),
  validateRequest({ body: restockSchema }),
  inventoryController.restock
);
