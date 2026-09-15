import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { productController } from './product.controller.js';
import { listProductsQuerySchema, createProductSchema } from './product.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Product routes.
 * Listing/detail are public and cached; create/update are admin-only.
 */
export const productRoutes = Router();

productRoutes.get('/', validateRequest({ query: listProductsQuerySchema }), productController.list);
productRoutes.get('/popular', productController.popular);
productRoutes.get('/slug/:slug', productController.bySlug);
productRoutes.get('/:id', validateRequest({ params: idParamSchema }), productController.get);

productRoutes.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ body: createProductSchema }),
  productController.create
);
productRoutes.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ params: idParamSchema, body: createProductSchema.partial() }),
  productController.update
);
