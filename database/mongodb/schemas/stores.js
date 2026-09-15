import mongoose from 'mongoose';

/**
 * stores — dark stores / micro-fulfillment centers (2dsphere location).
 */
const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'CLOSED'], default: 'ACTIVE' },
    timings: { openHour: { type: Number, default: 6 }, closeHour: { type: Number, default: 23 } },
    isDeliveryEnabled: { type: Boolean, default: true },
    deliveryRadiusMeters: { type: Number, default: 5000 },
    minOrderValue: { type: Number, default: 99 },
    rating: { type: Number, default: 4.5 },
  },
  { timestamps: true }
);

storeSchema.index({ location: '2dsphere' });
storeSchema.index({ status: 1, isDeliveryEnabled: 1 });

export const StoreSchema = storeSchema;
