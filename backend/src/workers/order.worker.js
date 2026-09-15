import { Worker } from 'bullmq';
import { queueClient } from '../config/redis.js';
import { orderQueue } from '../queues/index.js';
import { logger } from '../common/utils/logger.js';
import { notificationQueue } from '../queues/index.js';

/**
 * Order worker.
 *
 * Handles post-checkout work that must NOT block the checkout response:
 *   - order confirmation notifications
 *   - unpaid-order auto-cancellation (scheduled)
 *   - analytics/event emission
 */
export function createOrderWorker() {
  const worker = new Worker(
    'orders',
    async (job) => {
      switch (job.name) {
        case 'order.confirmed':
          return handleOrderConfirmed(job.data);
        case 'order.autoCancel':
          return handleAutoCancel(job.data);
        case 'order.statusChanged':
          return handleStatusChanged(job.data);
        default:
          logger.warn({ job: job.name }, 'Unknown order job');
          return null;
      }
    },
    { connection: queueClient, concurrency: 10 }
  );

  worker.on('completed', (job) => logger.debug({ job: job.name, id: job.id }, 'order job done'));
  worker.on('failed', (job, err) => logger.error({ err, job: job?.name }, 'order job failed'));

  return worker;
}

async function handleOrderConfirmed({ orderId, userId }) {
  logger.info({ orderId }, 'Order confirmed side-effects');

  // Enqueue the notification work (never block on sending).
  await notificationQueue.add(
    'send',
    {
      channel: 'PUSH',
      userId,
      template: 'ORDER_CONFIRMED',
      data: { orderId },
    },
    { jobId: `notif-order-confirmed-${orderId}` }
  );

  // Enqueue delivery assignment.
  const { deliveryQueue } = await import('../queues/index.js');
  await deliveryQueue.add('assign', { orderId }, { jobId: `delivery-assign-${orderId}` });

  return { orderId };
}

async function handleAutoCancel({ orderId }) {
  logger.info({ orderId }, 'Auto-cancel check');
  // The orders service performs the actual state-machine transition if still unpaid.
  const { orderService } = await import('../modules/orders/order.service.js');
  await orderService.autoCancelIfUnpaid(orderId);
  return { orderId };
}

async function handleStatusChanged({ orderId, previousStatus, newStatus }) {
  logger.info({ orderId, previousStatus, newStatus }, 'Order status changed side-effects');
  const { orderService } = await import('../modules/orders/order.service.js');
  await orderService.emitStatusNotification(orderId, newStatus);
  return { orderId };
}
