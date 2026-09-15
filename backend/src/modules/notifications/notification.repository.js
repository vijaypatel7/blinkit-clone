import { Notification } from './notification.model.js';

/**
 * Notification repository.
 */
export const notificationRepository = {
  async create(data) {
    return Notification.create(data);
  },

  async listByUser(userId, { limit = 20, cursor } = {}) {
    const filter = { userId };
    if (cursor) {
      const d = new Date(cursor);
      if (!Number.isNaN(d.getTime())) filter.sentAt = { $lt: d };
    }
    const items = await Notification.find(filter)
      .sort({ sentAt: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    return {
      items: page,
      nextCursor: hasMore ? page[page.length - 1].sentAt.toISOString() : null,
      hasMore,
    };
  },

  async markRead(userId, notificationId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );
  },

  async unreadCount(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  },
};
