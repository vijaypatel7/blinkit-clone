import mongoose from 'mongoose';

/**
 * store_zones — serviceable geographic areas per store (polygon or pincodes).
 */
const storeZoneSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    pincodes: [{ type: String }],
    boundary: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]] },
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

storeZoneSchema.index({ storeId: 1 });
storeZoneSchema.index({ boundary: '2dsphere' });
storeZoneSchema.index({ pincodes: 1 });

export const StoreZoneSchema = storeZoneSchema;
