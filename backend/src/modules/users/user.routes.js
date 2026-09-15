import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { userController } from './user.controller.js';
import { updateProfileSchema } from './user.validation.js';

/**
 * User routes (all authenticated).
 */
export const userRoutes = Router();

userRoutes.get('/me', userController.getProfile);
userRoutes.patch('/me', validateRequest({ body: updateProfileSchema }), userController.updateProfile);
