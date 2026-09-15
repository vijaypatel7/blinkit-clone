import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { searchController } from './search.controller.js';
import { searchQuerySchema } from './search.validation.js';

/**
 * Search routes (public).
 */
export const searchRoutes = Router();

searchRoutes.get('/', validateRequest({ query: searchQuerySchema }), searchController.search);
searchRoutes.get('/suggest', searchController.suggest);
