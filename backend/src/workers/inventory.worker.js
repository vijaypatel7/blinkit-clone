import { Worker } from 'bullmq';
import { queueClient } from '../config/redis.js';
import { logger } from '../common/utils/logger.js';

/**
 * Inventory worker.
 *
 * Handles non-critical inventory work off the request path:
 *   - releasing expired reservations
 *   - restock reconciliation
 *   - low-stock alerts
 */
export function createInventoryWorker() {
  const worker = new Worker(
    'inventory',
    async (job) => {
      switch (job.name) {
        case 'reservation.release':
          return handleRelease(job.data);
        case 'restock.reconcile':
          return handleRestock(job.data);
        case 'lowStock.alert':
          return handleLowStock(job.data);
        default:
          logger.warn({ job: job.name }, 'Unknown inventory job');
          return null;
      }
    },
    { connection: queueClient, concurrency: 5 }
  );

  worker.on('failed', (job, err) => logger.error({ err, job: job?.name }, 'inventory job failed'));
  return worker;
}

async function handleRelease({ storeId, productId, quantity, reservationId }) {
  const { inventoryService } = await import('../modules/inventory/inventory.service.js');
  await inventoryService.releaseReservation({ storeId, productId, quantity, reservationId });
  return { storeId, productId, quantity };
}

async function handleRestock({ storeId, productId, quantity }) {
  const { inventoryService } = await import('../modules/inventory/inventory.service.js');
  await inventoryService.restock({ storeId, productId, quantity });
  return { storeId, productId };
}

async function handleLowStock({ storeId, productId, availableQuantity }) {
  logger.warn({ storeId, productId, availableQuantity }, 'Low stock alert');
  // In production this would page store managers / trigger replenishment.
  return { storeId, productId };
}
