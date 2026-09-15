import { InsufficientStockError, NotFoundError } from '../../common/errors/AppError.js';
import { inventoryCache } from '../../cache/inventory.cache.js';
import { inventoryRepository } from './inventory.repository.js';
import { toInventoryResponse } from './inventory.mapper.js';
import { LOW_STOCK_THRESHOLD } from './inventory.constants.js';

/**
 * Inventory service.
 *
 * The single most important correctness guarantee in the system: stock is
 * reserved with an atomic conditional update so two users can never buy the
 * same last unit. Reads are served from Redis (very short TTL).
 */
export const inventoryService = {
  /** Availability check (cached, short TTL). */
  async checkAvailability(storeId, productId) {
    return inventoryCache.get(storeId, productId, async () => {
      const inv = await inventoryRepository.findByStoreProduct(storeId, productId);
      return {
        storeId,
        productId,
        availableQuantity: inv?.availableQuantity ?? 0,
        inStock: (inv?.availableQuantity ?? 0) > 0,
      };
    });
  },

  async getForStore(storeId) {
    const rows = await inventoryRepository.findByStore(storeId);
    return rows.map(toInventoryResponse);
  },

  /** Atomically reserve stock; throws InsufficientStockError on failure. */
  async reserve({ storeId, productId, quantity, referenceId }) {
    const inventory = await inventoryRepository.reserve({ storeId, productId, quantity, referenceId });
    if (!inventory) {
      throw new InsufficientStockError('Insufficient stock', { storeId, productId, quantity });
    }
    await this._invalidateAndAlert(storeId, productId, inventory);
    return toInventoryResponse(inventory);
  },

  async releaseReservation({ storeId, productId, quantity, referenceId }) {
    const inventory = await inventoryRepository.release({ storeId, productId, quantity, referenceId });
    await inventoryCache.invalidate(storeId, productId);
    return toInventoryResponse(inventory);
  },

  async deduct({ storeId, productId, quantity, referenceId }) {
    const inventory = await inventoryRepository.deduct({ storeId, productId, quantity, referenceId });
    await inventoryCache.invalidate(storeId, productId);
    return toInventoryResponse(inventory);
  },

  async restock({ storeId, productId, quantity }) {
    const inventory = await inventoryRepository.restock({ storeId, productId, quantity });
    await inventoryCache.invalidate(storeId, productId);
    return toInventoryResponse(inventory);
  },

  /** Refresh cache + fire a low-stock alert if needed (off the request path). */
  async _invalidateAndAlert(storeId, productId, inventory) {
    await inventoryCache.set(storeId, productId, {
      storeId,
      productId,
      availableQuantity: inventory.availableQuantity,
      inStock: inventory.availableQuantity > 0,
    });

    if (inventory.availableQuantity <= LOW_STOCK_THRESHOLD) {
      const { inventoryQueue } = await import('../../queues/index.js');
      await inventoryQueue.add('lowStock.alert', {
        storeId,
        productId,
        availableQuantity: inventory.availableQuantity,
      });
    }
  },
};
