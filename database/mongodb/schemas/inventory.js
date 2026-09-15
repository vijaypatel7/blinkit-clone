import mongoose from 'mongoose';

/**
 * inventory — stock per (store, product). All mutations are atomic.
 */
const inventorySchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    availableQuantity: { type: Number, required: true, min: 0 },
    reservedQuantity: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'], default: 'AVAILABLE' },
    lastRestockedAt: { type: Date },
  },
  { timestamps: true }
);

inventorySchema.index({ storeId: 1, productId: 1 }, { unique: true });
inventorySchema.index({ storeId: 1, status: 1 });
inventorySchema.index({ productId: 1, storeId: 1 });

export const InventorySchema = inventorySchema;
