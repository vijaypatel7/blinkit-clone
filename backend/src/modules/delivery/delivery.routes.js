import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { deliveryController } from './delivery.controller.js';
import { trackingPointSchema } from './delivery.validation.js';

/**
 * Delivery routes (authenticated).
 */
export const deliveryRoutes = Router();

deliveryRoutes.get('/order/:orderId', deliveryController.get);

// Delivery-partner only endpoints.
deliveryRoutes.post(
  '/:deliveryId/track',
  authenticate,
  authorize(ROLES.DELIVERY_PARTNER),
  validateRequest({ body: trackingPointSchema }),
  deliveryController.track
);

deliveryRoutes.post(
  '/order/:orderId/status',
  authenticate,
  authorize(ROLES.DELIVERY_PARTNER, ROLES.ADMIN),
  deliveryController.updateStatus
);
