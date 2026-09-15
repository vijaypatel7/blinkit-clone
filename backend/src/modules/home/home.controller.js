import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { homeService } from './home.service.js';

/**
 * Home controller.
 */
export const homeController = {
  getHome: asyncHandler(async (req, res) => {
    const { lat, lng, zone } = req.query;
    ok(res, await homeService.getHome({ lat, lng, zone }));
  }),
};
