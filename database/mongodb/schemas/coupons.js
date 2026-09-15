import mongoose from 'mongoose';

/**
 * coupons — discount codes.
 */
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
    value: { type: Number, required: true },
    minOrderValuePaise: { type: Number, default: 0 },
    maxDiscountPaise: { type: Number, default: null },
    maxUsesPerUser: { type: Number, default: 1 },
    maxTotalUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ status: 1 });

export const CouponSchema = couponSchema;
