import mongoose from 'mongoose';

/**
 * payment_transactions — append-only payment event ledger.
 */
const paymentTxnSchema = new mongoose.Schema(
  {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    type: { type: String, enum: ['AUTHORIZE', 'CAPTURE', 'REFUND', 'FAILURE'], required: true },
    amountPaise: { type: Number, required: true },
    gatewayReference: { type: String },
    rawPayload: { type: Map, of: String },
  },
  { timestamps: true }
);

paymentTxnSchema.index({ paymentId: 1, createdAt: -1 });
paymentTxnSchema.index({ orderId: 1 });

export const PaymentTransactionSchema = paymentTxnSchema;
