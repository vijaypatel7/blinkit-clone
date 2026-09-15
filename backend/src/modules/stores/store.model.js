import mongoose from 'mongoose';

/**
 * Store (dark store / micro-fulfillment center) model.
 *
 * Stores have a 2dsphere geo point so we can find the nearest serviceable
 * store for a customer's coordinates with `$near` / `$geoNear`.
 */
const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, index: true },
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
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },
    timings: {
      openHour: { type: Number, default: 6 },
      closeHour: { type: Number, default: 23 },
    },
    isDeliveryEnabled: { type: Boolean, default: true },
    deliveryRadiusMeters: { type: Number, default: 5000 },
    minOrderValue: { type: Number, default: 99 },
    rating: { type: Number, default: 4.5 },
    serviceZones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoreZone' }],
  },
  { timestamps: true }
);

storeSchema.index({ location: '2dsphere' });
storeSchema.index({ status: 1, isDeliveryEnabled: 1 });

export const Store = mongoose.model('Store', storeSchema);

/**
 * A service zone defines a geographic area a store delivers to.
 */
const storeZoneSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    pincodes: [{ type: String }],
    boundary: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]] }, // GeoJSON polygon
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

storeZoneSchema.index({ boundary: '2dsphere' });
storeZoneSchema.index({ pincodes: 1 });

export const StoreZone = mongoose.model('StoreZone', storeZoneSchema, 'store_zones');
