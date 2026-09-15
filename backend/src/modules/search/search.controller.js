import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { searchService } from './search.service.js';

/**
 * Search controller.
 */
export const searchController = {
  search: asyncHandler(async (req, res) => {
    const { q, type, limit } = req.query;
    ok(res, await searchService.search({ q, type, limit }));
  }),

  suggest: asyncHandler(async (req, res) => {
    ok(res, await searchService.suggest(req.query.q, { limit: req.query.limit }));
  }),
};
