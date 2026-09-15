import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { promotionService } from './promotion.service.js';

/**
 * Promotion controller.
 */
export const promotionController = {
  list: asyncHandler(async (req, res) => ok(res, await promotionService.listActive(req.query))),
  banners: asyncHandler(async (req, res) => ok(res, await promotionService.listBanners(req.query))),
  get: asyncHandler(async (req, res) => ok(res, await promotionService.get(req.params.id))),
  create: asyncHandler(async (req, res) => created(res, await promotionService.create(req.body))),
  update: asyncHandler(async (req, res) => ok(res, await promotionService.update(req.params.id, req.body))),
};
