import mongoose from 'mongoose';

/**
 * Durable cart document (MongoDB).
 *
 * The ACTIVE cart lives in Redis for low-latency reads/writes (see
 * cart.service.js); this collection is the durable copy that survives Redis
 * eviction and is used at checkout as an audit trail.
 */
const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, default: Date.now },
    unitPriceAtAdd: { type: Number }, // paise — snapshot for audit
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1, updatedAt: -1 });

export const Cart = mongoose.model('Cart', cartSchema);
