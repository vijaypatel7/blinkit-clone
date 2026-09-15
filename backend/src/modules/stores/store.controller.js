import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { storeService } from './store.service.js';

/**
 * Store controller.
 */
export const storeController = {
  get: asyncHandler(async (req, res) => ok(res, await storeService.get(req.params.id))),

  nearest: asyncHandler(async (req, res) => {
    const { lat, lng, radius } = req.query;
    ok(res, await storeService.resolveNearest({ lat, lng, radius }));
  }),

  nearby: asyncHandler(async (req, res) => {
    const { lat, lng, radius } = req.query;
    ok(res, await storeService.listNearby({ lat, lng, radius }));
  }),

  create: asyncHandler(async (req, res) => created(res, await storeService.create(req.body))),

  update: asyncHandler(async (req, res) =>
    ok(res, await storeService.update(req.params.id, req.body))
  ),
};
