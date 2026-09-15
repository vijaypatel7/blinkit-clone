import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { orderController } from './order.controller.js';
import { listOrdersQuerySchema, cancelOrderSchema } from './order.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Order routes (authenticated).
 */
export const orderRoutes = Router();

orderRoutes.get('/', validateRequest({ query: listOrdersQuerySchema }), orderController.list);
orderRoutes.get('/:id', validateRequest({ params: idParamSchema }), orderController.get);
orderRoutes.post(
  '/:id/cancel',
  validateRequest({ params: idParamSchema, body: cancelOrderSchema }),
  orderController.cancel
);
