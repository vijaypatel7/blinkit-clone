import { Worker } from 'bullmq';
import { queueClient } from '../config/redis.js';
import { logger } from '../common/utils/logger.js';

/**
 * Notification worker.
 *
 * Sends outbound notifications via multiple channels. This is deliberately
 * async and retried so a slow SMS provider never blocks checkout.
 *
 * Channels: PUSH, SMS, EMAIL, WHATSAPP.
 */
export function createNotificationWorker() {
  const worker = new Worker(
    'notifications',
    async (job) => {
      const { channel, userId, template, data } = job.data;
      const { notificationService } = await import('../modules/notifications/notification.service.js');
      await notificationService.dispatch({ channel, userId, template, data });
      return { channel, userId };
    },
    { connection: queueClient, concurrency: 20 }
  );

  worker.on('failed', (job, err) =>
    logger.error({ err, job: job?.name, channel: job?.data?.channel }, 'notification job failed')
  );
  return worker;
}
