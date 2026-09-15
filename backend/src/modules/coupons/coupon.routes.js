import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { couponController } from './coupon.controller.js';
import { createCouponSchema } from './coupon.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Coupon routes.
 */
export const couponRoutes = Router();

couponRoutes.get('/', couponController.list);
couponRoutes.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ body: createCouponSchema }),
  couponController.create
);
couponRoutes.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ params: idParamSchema, body: createCouponSchema.partial() }),
  couponController.update
);
