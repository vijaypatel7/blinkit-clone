import mongoose from 'mongoose';

/**
 * order_status_history — append-only audit of every order transition.
 */
const orderStatusHistorySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    fromStatus: { type: String },
    toStatus: { type: String, required: true },
    changedBy: { type: String, default: 'system' },
    note: { type: String },
  },
  { timestamps: true }
);

orderStatusHistorySchema.index({ orderId: 1, createdAt: 1 });

export const OrderStatusHistorySchema = orderStatusHistorySchema;
