import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { checkoutController } from './checkout.controller.js';
import { checkoutRequestSchema, quoteRequestSchema } from './checkout.validation.js';

/**
 * Checkout routes (authenticated).
 */
export const checkoutRoutes = Router();

checkoutRoutes.post('/quote', validateRequest({ body: quoteRequestSchema }), checkoutController.quote);
checkoutRoutes.post('/', validateRequest({ body: checkoutRequestSchema }), checkoutController.checkout);
