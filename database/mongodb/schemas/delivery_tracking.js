import mongoose from 'mongoose';

/**
 * delivery_tracking — GPS breadcrumbs for live tracking.
 */
const deliveryTrackingSchema = new mongoose.Schema(
  {
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

deliveryTrackingSchema.index({ deliveryId: 1, recordedAt: -1 });

export const DeliveryTrackingSchema = deliveryTrackingSchema;
