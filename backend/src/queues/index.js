/**
 * Queue definitions (BullMQ).
 *
 * Queues are the async backbone: anything that can happen AFTER the critical
 * request path (notifications, delivery assignment, analytics, inventory sync)
 * is enqueued here instead of blocking the response.
 */
import { Queue } from 'bullmq';
import { queueClient } from '../config/redis.js';

/** Default worker/queue options shared across all queues. */
const defaultOptions = {
  connection: queueClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  },
};

/** Order lifecycle side-effects (confirmations, analytics, auto-cancel). */
export const orderQueue = new Queue('orders', defaultOptions);

/** Inventory sync / restock / reservation-release jobs. */
export const inventoryQueue = new Queue('inventory', defaultOptions);

/** Outbound notifications (push, SMS, email, WhatsApp). */
export const notificationQueue = new Queue('notifications', defaultOptions);

/** Delivery assignment & tracking updates. */
export const deliveryQueue = new Queue('delivery', defaultOptions);

export const queues = {
  orderQueue,
  inventoryQueue,
  notificationQueue,
  deliveryQueue,
};
