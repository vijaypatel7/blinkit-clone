import mongoose from 'mongoose';

/**
 * orders — source of truth for the purchase lifecycle.
 * Money in paise; line items snapshot price at purchase time.
 */
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
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
    orderNumber: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    items: [orderItemSchema],
    totals: totalsSchema,
    status: {
      type: String,
      enum: ['CREATED', 'PAYMENT_PENDING', 'CONFIRMED', 'PACKING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'CREATED',
    },
    paymentMethod: { type: String, enum: ['CARD', 'UPI', 'NET_BANKING', 'WALLET', 'COD'] },
    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'], default: 'PENDING' },
    couponCode: { type: String },
    notes: { type: String },
    reservationId: { type: String },
    delivery: { expectedBy: { type: Date }, deliveredAt: { type: Date } },
    cancellation: { reason: { type: String }, cancelledAt: { type: Date } },
  },
  { timestamps: true }
);

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1 });
orderSchema.index({ paymentStatus: 1 });

export const OrderSchema = orderSchema;
