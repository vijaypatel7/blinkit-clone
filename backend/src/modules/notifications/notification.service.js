import { notificationRepository } from './notification.repository.js';
import { toNotificationResponse } from './notification.mapper.js';
import { NOTIFICATION_TEMPLATES } from './notification.constants.js';
import { logger } from '../../common/utils/logger.js';

/**
 * Notification service.
 *
 * `dispatch` is called by the notification worker. Each channel is a separate
 * provider adapter — a failure on one channel does not affect the others.
 */
const TEMPLATE_CONTENT = {
  [NOTIFICATION_TEMPLATES.OTP]: ({ otp }) => ({
    title: 'Your OTP',
    body: `Your verification code is ${otp}`,
  }),
  [NOTIFICATION_TEMPLATES.ORDER_CONFIRMED]: ({ orderId }) => ({
    title: 'Order confirmed',
    body: `Your order ${orderId} has been confirmed.`,
  }),
  [NOTIFICATION_TEMPLATES.ORDER_STATUS]: ({ orderNumber, status }) => ({
    title: 'Order update',
    body: `Order ${orderNumber} is now ${status}.`,
  }),
  [NOTIFICATION_TEMPLATES.ORDER_DELIVERED]: ({ orderNumber }) => ({
    title: 'Delivered',
    body: `Order ${orderNumber} has been delivered. Enjoy!`,
  }),
  [NOTIFICATION_TEMPLATES.OFFER]: ({ title, body }) => ({ title, body }),
};

export const notificationService = {
  /** Dispatch a notification across a channel (called by the worker). */
  async dispatch({ channel, userId, template, data }) {
    const content = (TEMPLATE_CONTENT[template] || (() => ({ title: template, body: '' })))(data);

    // Persist the notification record.
    const record = await notificationRepository.create({
      userId,
      template,
      channel,
      title: content.title,
      body: content.body,
      data,
    });

    // Per-channel provider adapters.
    await channelAdapters[channel]?.(record).catch((err) =>
      logger.warn({ err, channel, userId }, 'Channel dispatch failed (non-fatal)')
    );

    return toNotificationResponse(record);
  },

  async listByUser(userId, { limit, cursor } = {}) {
    const { items, nextCursor, hasMore } = await notificationRepository.listByUser(userId, { limit, cursor });
    return { items: items.map(toNotificationResponse), nextCursor, hasMore };
  },

  async markRead(userId, notificationId) {
    const updated = await notificationRepository.markRead(userId, notificationId);
    return toNotificationResponse(updated);
  },

  async unreadCount(userId) {
    return notificationRepository.unreadCount(userId);
  },
};

/**
 * Channel adapters (mock in this clone — swap with real providers).
 */
const channelAdapters = {
  PUSH: async (n) => logger.info({ userId: n.userId, body: n.body }, 'PUSH sent'),
  SMS: async (n) => logger.info({ userId: n.userId, body: n.body }, 'SMS sent'),
  EMAIL: async (n) => logger.info({ userId: n.userId, body: n.body }, 'EMAIL sent'),
  WHATSAPP: async (n) => logger.info({ userId: n.userId, body: n.body }, 'WHATSAPP sent'),
};
