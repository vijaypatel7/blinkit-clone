import mongoose from 'mongoose';

/**
 * Category model (self-referential tree).
 */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    image: { type: String },
    icon: { type: String },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ parentId: 1, sortOrder: 1 });

export const Category = mongoose.model('Category', categorySchema);
