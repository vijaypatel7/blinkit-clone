import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { homeController } from './home.controller.js';
import { homeQuerySchema } from './home.validation.js';

/**
 * Home routes (public).
 */
export const homeRoutes = Router();

homeRoutes.get('/', validateRequest({ query: homeQuerySchema }), homeController.getHome);
