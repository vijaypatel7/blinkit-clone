import mongoose from 'mongoose';
import { ORDER_STATUS } from './order.constants.js';

/**
 * Order model.
 *
 * Money is stored in paise. Line items snapshot the price at purchase time so
 * historical orders remain accurate even if a product's price changes later.
 */
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true }, // paise
    unitMrp: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const totalsSchema = new mongoose.Schema(
  {
    totalMrp: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    discountPaise: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },

    items: [orderItemSchema],
    totals: totalsSchema,

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED,
      index: true,
    },

    paymentMethod: { type: String, enum: ['COD', 'ONLINE'] },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },

    couponCode: { type: String },
    notes: { type: String },
    reservationId: { type: String },

    delivery: {
      expectedBy: { type: Date },
      deliveredAt: { type: Date },
    },

    cancellation: {
      reason: { type: String },
      cancelledAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Critical indexes (see the indexing strategy).
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1 });
orderSchema.index({ 'payment.status': 1 });

export const Order = mongoose.model('Order', orderSchema);

/**
 * Order status history — append-only audit trail of every transition.
 */
const orderStatusHistorySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    fromStatus: { type: String },
    toStatus: { type: String, required: true },
    changedBy: { type: String, default: 'system' }, // 'user' | 'admin' | 'system'
    note: { type: String },
  },
  { timestamps: true }
);

orderStatusHistorySchema.index({ orderId: 1, createdAt: 1 });

export const OrderStatusHistory = mongoose.model(
  'OrderStatusHistory',
  orderStatusHistorySchema,
  'order_status_history'
);
