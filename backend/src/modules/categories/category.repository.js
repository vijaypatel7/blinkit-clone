import { Category } from './category.model.js';

/**
 * Category repository.
 */
export const categoryRepository = {
  async findById(id) {
    return Category.findById(id);
  },

  async findBySlug(slug) {
    return Category.findOne({ slug });
  },

  async listByParent(parentId, { onlyActive = true } = {}) {
    const query = onlyActive ? { status: 'ACTIVE' } : {};
    return Category.find({ ...query, parentId: parentId || null }).sort({ sortOrder: 1 });
  },

  async listAll({ onlyActive = true } = {}) {
    const query = onlyActive ? { status: 'ACTIVE' } : {};
    return Category.find(query).sort({ sortOrder: 1 });
  },

  async create(data) {
    return Category.create(data);
  },

  async update(id, data) {
    return Category.findByIdAndUpdate(id, { $set: data }, { new: true });
  },
};
