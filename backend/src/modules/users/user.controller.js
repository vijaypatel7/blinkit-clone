import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { userService } from './user.service.js';

/**
 * User controller.
 */
export const userController = {
  getProfile: asyncHandler(async (req, res) => {
    const profile = await userService.getProfile(req.user.id);
    return ok(res, profile);
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const profile = await userService.updateProfile(req.user.id, req.body);
    return ok(res, profile);
  }),
};
