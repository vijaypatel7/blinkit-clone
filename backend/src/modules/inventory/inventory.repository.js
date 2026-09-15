import { Inventory, InventoryTransaction } from './inventory.model.js';

/**
 * Inventory repository.
 *
 * All stock changes are atomic, conditional MongoDB updates. The condition
 * `availableQuantity >= qty` guarantees we never oversell regardless of
 * concurrency.
 */
export const inventoryRepository = {
  async findByStoreProduct(storeId, productId) {
    return Inventory.findOne({ storeId, productId }).lean();
  },

  async findByStore(storeId) {
    return Inventory.find({ storeId }).lean();
  },

  /** Upsert a stock row (used by seed/admin). */
  async upsert(storeId, productId, availableQuantity) {
    return Inventory.findOneAndUpdate(
      { storeId, productId },
      { $set: { availableQuantity }, $setOnInsert: { reservedQuantity: 0 } },
      { upsert: true, new: true }
    );
  },

  /**
   * Atomically reserve stock.
   * Returns the updated doc, or null if there wasn't enough available quantity.
   */
  async reserve({ storeId, productId, quantity, referenceId }) {
    const inventory = await Inventory.findOneAndUpdate(
      { storeId, productId, availableQuantity: { $gte: quantity } },
      {
        $inc: { availableQuantity: -quantity, reservedQuantity: quantity },
        $set: { status: 'AVAILABLE' },
      },
      { new: true }
    );
    if (!inventory) return null;

    await this._record({
      storeId,
      productId,
      inventoryId: inventory._id,
      type: 'RESERVE',
      quantity,
      referenceId,
      previousAvailable: inventory.availableQuantity + quantity,
      newAvailable: inventory.availableQuantity,
    });
    return inventory;
  },

  /** Release a previously reserved quantity back to available. */
  async release({ storeId, productId, quantity, referenceId }) {
    const inventory = await Inventory.findOneAndUpdate(
      { storeId, productId, reservedQuantity: { $gte: quantity } },
      { $inc: { availableQuantity: quantity, reservedQuantity: -quantity } },
      { new: true }
    );
    if (!inventory) return null;

    await this._record({
      storeId,
      productId,
      inventoryId: inventory._id,
      type: 'RELEASE',
      quantity,
      referenceId,
      previousAvailable: inventory.availableQuantity - quantity,
      newAvailable: inventory.availableQuantity,
    });
    return inventory;
  },

  /** Deduct reserved stock permanently (order packed/shipped). */
  async deduct({ storeId, productId, quantity, referenceId }) {
    const inventory = await Inventory.findOneAndUpdate(
      { storeId, productId, reservedQuantity: { $gte: quantity } },
      { $inc: { reservedQuantity: -quantity } },
      { new: true }
    );
    if (!inventory) return null;

    await this._record({
      storeId,
      productId,
      inventoryId: inventory._id,
      type: 'DEDUCT',
      quantity,
      referenceId,
    });
    return inventory;
  },

  /** Add stock (restock). */
  async restock({ storeId, productId, quantity }) {
    const inventory = await Inventory.findOneAndUpdate(
      { storeId, productId },
      {
        $inc: { availableQuantity: quantity },
        $set: { lastRestockedAt: new Date() },
      },
      { new: true }
    );
    if (!inventory) return null;

    await this._record({
      storeId,
      productId,
      inventoryId: inventory._id,
      type: 'RESTOCK',
      quantity,
      previousAvailable: inventory.availableQuantity - quantity,
      newAvailable: inventory.availableQuantity,
    });
    return inventory;
  },

  async recordAdjustment({ storeId, productId, quantity, referenceId }) {
    const inventory = await Inventory.findOneAndUpdate(
      { storeId, productId },
      { $inc: { availableQuantity: quantity } },
      { new: true }
    );
    if (!inventory) return null;
    await this._record({
      storeId,
      productId,
      inventoryId: inventory._id,
      type: 'ADJUSTMENT',
      quantity,
      referenceId,
    });
    return inventory;
  },

  /** Append-only ledger entry. */
  async _record(entry) {
    return InventoryTransaction.create(entry);
  },
};
