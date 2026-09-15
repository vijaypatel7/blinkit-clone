import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { addressService } from './address.service.js';

/**
 * Address controller.
 */
export const addressController = {
  list: asyncHandler(async (req, res) => ok(res, await addressService.list(req.user.id))),

  create: asyncHandler(async (req, res) =>
    created(res, await addressService.create(req.user.id, req.body))
  ),

  update: asyncHandler(async (req, res) =>
    ok(res, await addressService.update(req.user.id, req.params.id, req.body))
  ),

  setDefault: asyncHandler(async (req, res) =>
    ok(res, await addressService.setDefault(req.user.id, req.params.id))
  ),

  remove: asyncHandler(async (req, res) =>
    ok(res, await addressService.remove(req.user.id, req.params.id))
  ),
};
