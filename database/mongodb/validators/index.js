import mongoose from 'mongoose';

/**
 * MongoDB `$jsonSchema` validators.
 *
 * These enforce document shape at the DATABASE level (defense in depth on top
 * of the application-layer Mongoose validation). Applied via `collMod`.
 *
 * Usage:  MONGODB_URI=... node validators/index.js
 */

/** Build a $jsonSchema validator from a field spec (kept minimal & additive). */
const jsonSchema = (properties, required = []) => ({
  $jsonSchema: {
    bsonType: 'object',
    required,
    additionalProperties: true,
    properties,
  },
});

const VALIDATORS = {
  users: jsonSchema(
    {
      phone: { bsonType: 'string', description: 'required, unique phone' },
      role: {
        enum: ['CUSTOMER', 'DELIVERY_PARTNER', 'STORE_MANAGER', 'ADMIN'],
        description: 'user role',
      },
    },
    ['phone', 'role']
  ),
  products: jsonSchema(
    {
      sku: { bsonType: 'string', description: 'required, unique SKU' },
      'pricing.price': { bsonType: 'int', minimum: 0, description: 'price in paise' },
      'pricing.mrp': { bsonType: 'int', minimum: 0, description: 'MRP in paise' },
    },
    ['sku']
  ),
  orders: jsonSchema(
    {
      status: {
        enum: ['CREATED', 'PAYMENT_PENDING', 'CONFIRMED', 'PACKING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
        description: 'order status',
      },
      'totals.grandTotal': { bsonType: 'int', minimum: 0 },
    },
    ['status']
  ),
  inventory: jsonSchema(
    {
      availableQuantity: { bsonType: 'int', minimum: 0 },
      reservedQuantity: { bsonType: 'int', minimum: 0 },
    },
    ['availableQuantity', 'reservedQuantity']
  ),
};

/** Apply all validators. */
export async function applyValidators(connection) {
  const results = [];
  for (const [collectionName, validator] of Object.entries(VALIDATORS)) {
    try {
      await connection.db.command({
        collMod: collectionName,
        validator,
        validationLevel: 'moderate',
        validationAction: 'warn', // warn, don't hard-fail (app already validates)
      });
      results.push({ collection: collectionName, status: 'applied' });
    } catch (err) {
      // collMod fails if the collection doesn't exist yet — that's fine.
      results.push({ collection: collectionName, status: 'skipped', reason: err.message });
    }
  }
  return results;
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit';
  await mongoose.connect(uri);
  const results = await applyValidators(mongoose.connection);
  // eslint-disable-next-line no-console
  console.table(results);
  await mongoose.disconnect();
}
