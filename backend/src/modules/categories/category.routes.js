import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { categoryController } from './category.controller.js';
import { createCategorySchema } from './category.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Category routes.
 */
export const categoryRoutes = Router();

categoryRoutes.get('/tree', categoryController.tree);
categoryRoutes.get('/parent/:parentId', categoryController.byParent);
categoryRoutes.get('/:id', validateRequest({ params: idParamSchema }), categoryController.get);

categoryRoutes.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ body: createCategorySchema }),
  categoryController.create
);
categoryRoutes.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ params: idParamSchema, body: createCategorySchema.partial() }),
  categoryController.update
);
