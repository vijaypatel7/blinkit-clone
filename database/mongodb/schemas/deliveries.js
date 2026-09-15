import mongoose from 'mongoose';

/**
 * deliveries — delivery records per order.
 */
const deliverySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['UNASSIGNED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'],
      default: 'UNASSIGNED',
    },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    estimatedMinutes: { type: Number, default: 30 },
  },
  { timestamps: true }
);

deliverySchema.index({ orderId: 1 }, { unique: true });
deliverySchema.index({ deliveryPartnerId: 1, status: 1 });

export const DeliverySchema = deliverySchema;
