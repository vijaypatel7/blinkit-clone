import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authController } from './auth.controller.js';
import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from './auth.validation.js';

/**
 * Auth routes — all public (no auth required).
 */
export const authRoutes = Router();

authRoutes.post('/otp/send', validateRequest({ body: sendOtpSchema }), authController.sendOtp);
authRoutes.post('/otp/verify', validateRequest({ body: verifyOtpSchema }), authController.verifyOtp);
authRoutes.post('/refresh', validateRequest({ body: refreshTokenSchema }), authController.refresh);
authRoutes.post('/logout', authController.logout);
