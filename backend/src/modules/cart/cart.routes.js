import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { cartController } from './cart.controller.js';
import { addItemSchema, updateItemSchema } from './cart.validation.js';

/**
 * Cart routes (authenticated).
 */
export const cartRoutes = Router();

cartRoutes.get('/', cartController.get);
cartRoutes.post('/items', validateRequest({ body: addItemSchema }), cartController.addItem);
cartRoutes.patch(
  '/items/:productId',
  validateRequest({ body: updateItemSchema }),
  cartController.updateQuantity
);
cartRoutes.delete('/items/:productId', cartController.removeItem);
cartRoutes.delete('/', cartController.clear);
