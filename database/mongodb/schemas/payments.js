import mongoose from 'mongoose';

/**
 * payments — one document per payment attempt.
 */
const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amountPaise: { type: Number, required: true },
    method: { type: String, enum: ['CARD', 'UPI', 'NET_BANKING', 'WALLET', 'COD'] },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'],
      default: 'PENDING',
    },
    gatewayReference: { type: String },
    gatewayResponse: { type: Map, of: String },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

export const PaymentSchema = paymentSchema;
