import mongoose from 'mongoose';

/**
 * Coupon model.
 */
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, index: true, uppercase: true, trim: true },
    type: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
    value: { type: Number, required: true }, // percentage (0-100) or flat paise
    minOrderValuePaise: { type: Number, default: 0 },
    maxDiscountPaise: { type: Number, default: null }, // cap (optional)
    maxUsesPerUser: { type: Number, default: 1 },
    maxTotalUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
