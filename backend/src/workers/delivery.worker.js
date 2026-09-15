import { Worker } from 'bullmq';
import { queueClient } from '../config/redis.js';
import { logger } from '../common/utils/logger.js';

/**
 * Delivery worker.
 *
 * Assigns delivery partners to confirmed orders and processes tracking pings.
 * Assignment is a potentially slow operation (finding the nearest available
 * partner) so it runs off the critical path.
 */
export function createDeliveryWorker() {
  const worker = new Worker(
    'delivery',
    async (job) => {
      switch (job.name) {
        case 'assign':
          return handleAssign(job.data);
        case 'tracking.update':
          return handleTrackingUpdate(job.data);
        default:
          logger.warn({ job: job.name }, 'Unknown delivery job');
          return null;
      }
    },
    { connection: queueClient, concurrency: 10 }
  );

  worker.on('failed', (job, err) => logger.error({ err, job: job?.name }, 'delivery job failed'));
  return worker;
}

async function handleAssign({ orderId }) {
  const { deliveryService } = await import('../modules/delivery/delivery.service.js');
  await deliveryService.assignPartner(orderId);
  return { orderId };
}

async function handleTrackingUpdate({ deliveryId, location }) {
  const { deliveryService } = await import('../modules/delivery/delivery.service.js');
  await deliveryService.appendTrackingPoint(deliveryId, location);
  return { deliveryId };
}
