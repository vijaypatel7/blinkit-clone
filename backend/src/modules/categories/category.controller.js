import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { categoryService } from './category.service.js';

/**
 * Category controller.
 */
export const categoryController = {
  tree: asyncHandler(async (_req, res) => ok(res, await categoryService.getTree())),

  get: asyncHandler(async (req, res) => ok(res, await categoryService.getById(req.params.id))),

  byParent: asyncHandler(async (req, res) =>
    ok(res, await categoryService.listByParent(req.params.parentId || null))
  ),

  create: asyncHandler(async (req, res) => created(res, await categoryService.create(req.body))),

  update: asyncHandler(async (req, res) =>
    ok(res, await categoryService.update(req.params.id, req.body))
  ),
};
