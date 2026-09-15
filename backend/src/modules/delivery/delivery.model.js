import mongoose from 'mongoose';

/**
 * Delivery model.
 */
const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },

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

deliverySchema.index({ deliveryPartnerId: 1, status: 1 });
deliverySchema.index({ orderId: 1 }, { unique: true });

export const Delivery = mongoose.model('Delivery', deliverySchema);

/**
 * Delivery tracking — append-only GPS breadcrumbs for live tracking.
 */
const deliveryTrackingSchema = new mongoose.Schema(
  {
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true, index: true },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

deliveryTrackingSchema.index({ deliveryId: 1, recordedAt: -1 });

export const DeliveryTracking = mongoose.model(
  'DeliveryTracking',
  deliveryTrackingSchema,
  'delivery_tracking'
);

/**
 * Delivery partner model (separate from User for richer fields).
 */
const deliveryPartnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    vehicleType: { type: String },
    rating: { type: Number, default: 5 },
    completedDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });
deliveryPartnerSchema.index({ isOnline: 1 });

export const DeliveryPartner = mongoose.model(
  'DeliveryPartner',
  deliveryPartnerSchema,
  'delivery_partners'
);
