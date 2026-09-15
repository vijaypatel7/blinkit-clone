import mongoose from 'mongoose';

/**
 * Payment model — one document per payment attempt.
 */
const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountPaise: { type: Number, required: true },
    method: { type: String, enum: ['COD', 'ONLINE'] },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    gatewayReference: { type: String },
    gatewayResponse: { type: Map, of: String },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);

/**
 * Payment transactions — append-only ledger of auth/capture/refund events.
 */
const paymentTxnSchema = new mongoose.Schema(
  {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    type: { type: String, enum: ['AUTHORIZE', 'CAPTURE', 'REFUND', 'FAILURE'], required: true },
    amountPaise: { type: Number, required: true },
    gatewayReference: { type: String },
    rawPayload: { type: Map, of: String },
  },
  { timestamps: true }
);

export const PaymentTransaction = mongoose.model(
  'PaymentTransaction',
  paymentTxnSchema,
  'payment_transactions'
);
