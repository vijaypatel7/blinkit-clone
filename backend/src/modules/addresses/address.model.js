import mongoose from 'mongoose';

/**
 * User address model.
 *
 * `location` holds a GeoJSON point (2dsphere index) so we can find the nearest
 * serviceable store for the user's delivery address.
 */
const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
    pincode: { type: String, trim: true, index: true },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ location: '2dsphere' });

export const Address = mongoose.model('Address', addressSchema);
