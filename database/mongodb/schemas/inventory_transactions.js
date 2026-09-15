import mongoose from 'mongoose';

/**
 * inventory_transactions — append-only stock ledger.
 */
const inventoryTxnSchema = new mongoose.Schema(
  {
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    storeId: { type: mongoose.Schema.Types.ObjectId },
    productId: { type: mongoose.Schema.Types.ObjectId },
    type: {
      type: String,
      enum: ['RESERVE', 'RELEASE', 'DEDUCT', 'RESTOCK', 'ADJUSTMENT'],
      required: true,
    },
    quantity: { type: Number, required: true },
    referenceId: { type: String },
    previousAvailable: { type: Number },
    newAvailable: { type: Number },
  },
  { timestamps: true }
);

inventoryTxnSchema.index({ inventoryId: 1, createdAt: -1 });
inventoryTxnSchema.index({ productId: 1, createdAt: -1 });

export const InventoryTransactionSchema = inventoryTxnSchema;
