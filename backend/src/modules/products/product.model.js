import mongoose from 'mongoose';

/**
 * Product model.
 *
 * Pricing is stored in paise (integer) to avoid floating-point issues, with
 * `mrp` (maximum retail price) and `price` (selling price).
 */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    sku: { type: String, unique: true, index: true, required: true },
    brand: { type: String, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    description: { type: String },
    images: [{ type: String }],
    attributes: { type: Map, of: String },

    pricing: {
      mrp: { type: Number, required: true }, // paise
      price: { type: Number, required: true }, // paise
      currency: { type: String, default: 'INR' },
    },

    unit: { type: String, default: 'pcs' }, // e.g. '500ml', '1kg'
    taxCategory: { type: String, default: 'GST5' },

    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'], default: 'ACTIVE', index: true },

    popularity: { type: Number, default: 0, index: true }, // for trending lists
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ status: 1, popularity: -1 });

export const Product = mongoose.model('Product', productSchema);
