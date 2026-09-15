import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { authService } from './auth.service.js';

/**
 * Auth controller — thin HTTP layer over the auth service.
 */
export const authController = {
  sendOtp: asyncHandler(async (req, res) => {
    const result = await authService.sendOtp(req.body);
    return ok(res, result);
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const result = await authService.verifyOtp(req.body);
    return ok(res, result);
  }),

  refresh: asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.body.refreshToken);
    return ok(res, result);
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.body?.refreshToken);
    return ok(res, { loggedOut: true });
  }),
};
