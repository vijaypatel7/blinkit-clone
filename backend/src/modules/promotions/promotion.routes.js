import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { promotionController } from './promotion.controller.js';
import { createPromotionSchema, listPromotionsQuerySchema } from './promotion.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Promotion routes.
 */
export const promotionRoutes = Router();

promotionRoutes.get('/', validateRequest({ query: listPromotionsQuerySchema }), promotionController.list);
promotionRoutes.get('/banners', promotionController.banners);
promotionRoutes.get('/:id', validateRequest({ params: idParamSchema }), promotionController.get);

promotionRoutes.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ body: createPromotionSchema }),
  promotionController.create
);
promotionRoutes.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ params: idParamSchema, body: createPromotionSchema.partial() }),
  promotionController.update
);
