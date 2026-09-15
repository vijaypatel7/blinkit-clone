/**
 * Worker bootstrap.
 *
 * Workers consume queue jobs in separate processes (or threads). For a single
 * node we start them in-process; in production you'd run `node src/workers/*.js`
 * as separate processes to isolate CPU-heavy work from the API.
 */
import { logger } from '../common/utils/logger.js';
import { createOrderWorker } from './order.worker.js';
import { createInventoryWorker } from './inventory.worker.js';
import { createNotificationWorker } from './notification.worker.js';
import { createDeliveryWorker } from './delivery.worker.js';

let activeWorkers = [];

export async function startWorkers() {
  // In test mode we skip workers (tests drive services directly).
  if (process.env.NODE_ENV === 'test') return;

  activeWorkers = [
    createOrderWorker(),
    createInventoryWorker(),
    createNotificationWorker(),
    createDeliveryWorker(),
  ];

  logger.info('Queue workers started');
}

export async function stopWorkers() {
  await Promise.all(activeWorkers.map((w) => w.close().catch(() => {})));
  activeWorkers = [];
}
