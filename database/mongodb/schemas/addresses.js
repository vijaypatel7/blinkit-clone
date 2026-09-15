import mongoose from 'mongoose';

/**
 * addresses — user delivery addresses with a GeoJSON point.
 */
const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' },
    label: { type: String, trim: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    flat: { type: String, trim: true },
    building: { type: String, trim: true },
    street: { type: String, trim: true },
    landmark: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ location: '2dsphere' });

export const AddressSchema = addressSchema;
