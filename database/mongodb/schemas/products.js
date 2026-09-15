import mongoose from 'mongoose';

/**
 * products — catalog. Pricing in paise (integer).
 */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    sku: { type: String, unique: true, required: true },
    brand: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String },
    images: [{ type: String }],
    attributes: { type: Map, of: String },
    pricing: {
      mrp: { type: Number, required: true },   // paise
      price: { type: Number, required: true }, // paise
      currency: { type: String, default: 'INR' },
    },
    unit: { type: String, default: 'pcs' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'], default: 'ACTIVE' },
    popularity: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ status: 1, popularity: -1 });

export const ProductSchema = productSchema;
