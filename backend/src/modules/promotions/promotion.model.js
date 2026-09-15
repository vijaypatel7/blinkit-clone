import mongoose from 'mongoose';

/**
 * Promotion model — banners, carousels, offers, deals shown on the home page.
 */
const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['BANNER', 'CAROUSEL', 'OFFER', 'DEAL'], required: true },
    image: { type: String },
    description: { type: String },
    link: { type: String }, // deeplink / route
    priority: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'SCHEDULED', 'EXPIRED'], default: 'ACTIVE', index: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    // Target only specific zones (empty = all zones).
    zones: [{ type: String }],
    // Optional coupon attached to the promo.
    couponCode: { type: String },
  },
  { timestamps: true }
);

promotionSchema.index({ status: 1, priority: -1 });
promotionSchema.index({ startsAt: 1, endsAt: 1 });

export const Promotion = mongoose.model('Promotion', promotionSchema);
