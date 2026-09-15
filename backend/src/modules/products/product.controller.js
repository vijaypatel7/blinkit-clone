import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { productService } from './product.service.js';

/**
 * Product controller.
 */
export const productController = {
  list: asyncHandler(async (req, res) => {
    const result = await productService.list(req.query);
    return ok(res, {
      items: result.items,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  }),

  get: asyncHandler(async (req, res) => ok(res, await productService.getDetail(req.params.id))),

  bySlug: asyncHandler(async (req, res) => ok(res, await productService.getBySlug(req.params.slug))),

  popular: asyncHandler(async (req, res) => {
    const zone = req.query.zone || 'default';
    ok(res, await productService.listPopular(zone, { limit: req.query.limit }));
  }),

  create: asyncHandler(async (req, res) => created(res, await productService.create(req.body))),

  update: asyncHandler(async (req, res) =>
    ok(res, await productService.update(req.params.id, req.body))
  ),
};
