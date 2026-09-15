import mongoose from 'mongoose';

/**
 * Inventory model — one document per (store, product) pair.
 *
 * This is the source of truth for stock. All mutations go through atomic
 * updates (`availableQuantity >= requested` guards) so two concurrent orders
 * can never oversell the same unit.
 */
const inventorySchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

    availableQuantity: { type: Number, required: true, min: 0 },
    reservedQuantity: { type: Number, required: true, default: 0, min: 0 },

    status: {
      type: String,
      enum: ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'],
      default: 'AVAILABLE',
    },

    lastRestockedAt: { type: Date },
  },
  { timestamps: true }
);

// Critical indexes — see the indexing strategy in database/mongodb/indexes.
inventorySchema.index({ storeId: 1, productId: 1 }, { unique: true });
inventorySchema.index({ storeId: 1, status: 1 });
inventorySchema.index({ productId: 1, storeId: 1 });

// Explicit collection name — the canonical `database/` layer (schemas, indexes,
// seed) uses `inventory` (singular). Mongoose would otherwise default to the
// plural `inventories`, silently pointing the model at an empty collection and
// making every checkout fail with "insufficient stock".
export const Inventory = mongoose.model('Inventory', inventorySchema, 'inventory');

/**
 * Append-only ledger of every inventory mutation, for auditing & reconciliation.
 */
const inventoryTxnSchema = new mongoose.Schema(
  {
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', index: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, index: true },
    type: {
      type: String,
      enum: ['RESERVE', 'RELEASE', 'DEDUCT', 'RESTOCK', 'ADJUSTMENT'],
      required: true,
    },
    quantity: { type: Number, required: true },
    referenceId: { type: String }, // orderId / reservationId
    previousAvailable: { type: Number },
    newAvailable: { type: Number },
  },
  { timestamps: true }
);

inventoryTxnSchema.index({ productId: 1, createdAt: -1 });

export const InventoryTransaction = mongoose.model(
  'InventoryTransaction',
  inventoryTxnSchema,
  'inventory_transactions'
);
