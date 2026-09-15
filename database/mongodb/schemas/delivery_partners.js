import mongoose from 'mongoose';

/**
 * delivery_partners — partner profiles + live location (2dsphere).
 */
const deliveryPartnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
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

export const DeliveryPartnerSchema = deliveryPartnerSchema;
