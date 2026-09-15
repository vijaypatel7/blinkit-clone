import mongoose from 'mongoose';

/**
 * promotions — banners, carousels, offers, deals.
 */
const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['BANNER', 'CAROUSEL', 'OFFER', 'DEAL'], required: true },
    image: { type: String },
    description: { type: String },
    link: { type: String },
    priority: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'SCHEDULED', 'EXPIRED'], default: 'ACTIVE' },
    startsAt: { type: Date },
    endsAt: { type: Date },
    zones: [{ type: String }],
    couponCode: { type: String },
  },
  { timestamps: true }
);

promotionSchema.index({ status: 1, priority: -1 });
promotionSchema.index({ startsAt: 1, endsAt: 1 });

export const PromotionSchema = promotionSchema;
