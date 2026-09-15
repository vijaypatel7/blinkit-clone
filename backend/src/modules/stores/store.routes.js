import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { storeController } from './store.controller.js';
import { createStoreSchema, nearbyStoresQuerySchema } from './store.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Store routes.
 * Reads are public; create/update are admin-only.
 */
export const storeRoutes = Router();

storeRoutes.get('/nearby', validateRequest({ query: nearbyStoresQuerySchema }), storeController.nearby);
storeRoutes.get('/nearest', validateRequest({ query: nearbyStoresQuerySchema }), storeController.nearest);
storeRoutes.get('/:id', validateRequest({ params: idParamSchema }), storeController.get);

storeRoutes.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ body: createStoreSchema }),
  storeController.create
);
storeRoutes.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validateRequest({ params: idParamSchema, body: createStoreSchema.partial() }),
  storeController.update
);
