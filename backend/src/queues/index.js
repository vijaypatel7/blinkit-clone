/**
 * Queue definitions (BullMQ).
 *
 * Queues are the async backbone: anything that can happen AFTER the critical
 * request path (notifications, delivery assignment, analytics, inventory sync)
 * is enqueued here instead of blocking the response.
 */

import { Queue } from 'bullmq';
import { queueClient } from '../config/redis.js';
import { env } from '../config/environment.js';

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

/**
 * Queue creation is skipped during tests.
 *
 * The HTTP/application tests do not need BullMQ.
 * This prevents Redis connections from keeping the Node test process alive.
 */
const createQueue = (name) => {
  if (env.nodeEnv === 'test') {
    return null;
  }

  return new Queue(name, defaultOptions);
};

/** Order lifecycle side-effects. */
export const orderQueue = createQueue('orders');

/** Inventory sync / restock / reservation-release jobs. */
export const inventoryQueue = createQueue('inventory');

/** Outbound notifications. */
export const notificationQueue = createQueue('notifications');

/** Delivery assignment & tracking updates. */
export const deliveryQueue = createQueue('delivery');

export const queues = {
  orderQueue,
  inventoryQueue,
  notificationQueue,
  deliveryQueue,
};