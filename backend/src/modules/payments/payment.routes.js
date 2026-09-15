import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../common/constants/index.js';
import { paymentController } from './payment.controller.js';
import { initiatePaymentSchema, verifyPaymentSchema } from './payment.validation.js';

/**
 * Payment routes.
 * The webhook is public (no auth); everything else is authenticated.
 */
export const paymentRoutes = Router();

// Public gateway callback.
paymentRoutes.post('/webhook', paymentController.webhook);

paymentRoutes.post('/', validateRequest({ body: initiatePaymentSchema }), paymentController.initiate);
paymentRoutes.post('/verify', validateRequest({ body: verifyPaymentSchema }), paymentController.verify);
paymentRoutes.get('/order/:orderId', paymentController.getByOrder);
paymentRoutes.post('/order/:orderId/refund', authenticate, authorize(ROLES.ADMIN), paymentController.refund);
