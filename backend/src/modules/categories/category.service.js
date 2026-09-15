import { NotFoundError } from '../../common/errors/AppError.js';
import { categoryCache } from '../../cache/category.cache.js';
import { categoryRepository } from './category.repository.js';
import { toCategoryResponse, toCategoryTree } from './category.mapper.js';

/**
 * Category service.
 *
 * Categories are extremely stable, so the whole tree is cached in Redis with a
 * long TTL (30–60 min) and invalidated only on admin edits.
 */
export const categoryService = {
  /** Return the full category tree (cached). */
  async getTree() {
    return categoryCache.getTree(async () => {
      const categories = await categoryRepository.listAll();
      return toCategoryTree(categories);
    });
  },

  async getById(categoryId) {
    const category = await categoryCache.get(categoryId, () =>
      categoryRepository.findById(categoryId)
    );
    if (!category) throw new NotFoundError('Category not found');
    return toCategoryResponse(category);
  },

  async listByParent(parentId) {
    return categoryCache.getByParent(parentId, async () => {
      const categories = await categoryRepository.listByParent(parentId);
      return categories.map(toCategoryResponse);
    });
  },

  // ------------------------------------------------------------------
  // Admin
  // ------------------------------------------------------------------
  async create(data) {
    const category = await categoryRepository.create(data);
    await categoryCache.invalidate(category._id);
    return toCategoryResponse(category);
  },

  async update(categoryId, data) {
    const category = await categoryRepository.update(categoryId, data);
    if (!category) throw new NotFoundError('Category not found');
    await categoryCache.invalidate(categoryId);
    return toCategoryResponse(category);
  },
};
