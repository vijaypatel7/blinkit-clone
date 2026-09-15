import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { reviewController } from './review.controller.js';
import { createReviewSchema, listReviewsQuerySchema } from './review.validation.js';

/**
 * Review routes.
 * Reading is public; creating requires auth.
 */
export const reviewRoutes = Router();

reviewRoutes.get('/product/:productId', validateRequest({ query: listReviewsQuerySchema }), reviewController.list);
reviewRoutes.get('/product/:productId/summary', reviewController.summary);
reviewRoutes.post('/', authenticate, validateRequest({ body: createReviewSchema }), reviewController.create);
