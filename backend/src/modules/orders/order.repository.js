import { Order, OrderStatusHistory } from './order.model.js';
import { ORDER_STATUS } from './order.constants.js';

/**
 * Order repository.
 *
 * All list queries are BOUNDED (limit + cursor). We never do `Order.find({ userId })`
 * without pagination.
 */
export const orderRepository = {
  async findById(orderId) {
    return Order.findById(orderId);
  },

  async findByOrderNumber(orderNumber) {
    return Order.findOne({ orderNumber });
  },

  async create(data) {
    return Order.create(data);
  },

  /**
   * List a user's orders with cursor pagination (bounded).
   */
  async listByUser(userId, { limit = 20, cursor } = {}) {
    const filter = { userId };
    if (cursor) {
      const createdAt = new Date(cursor);
      if (!Number.isNaN(createdAt.getTime())) filter.createdAt = { $lt: createdAt };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = orders.length > limit;
    const page = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore ? page[page.length - 1].createdAt.toISOString() : null;
    return { items: page, nextCursor, hasMore };
  },

  /**
   * List orders by store + status (bounded, used by store ops/admin).
   */
  async listByStore(storeId, { status, limit = 20, cursor } = {}) {
    const filter = { storeId };
    if (status) filter.status = status;
    if (cursor) {
      const createdAt = new Date(cursor);
      if (!Number.isNaN(createdAt.getTime())) filter.createdAt = { $lt: createdAt };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = orders.length > limit;
    const page = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore ? page[page.length - 1].createdAt.toISOString() : null;
    return { items: page, nextCursor, hasMore };
  },

  /** Atomically transition status IF currently in `fromStatus`. */
  async transition(orderId, fromStatus, toStatus) {
    return Order.findOneAndUpdate(
      { _id: orderId, status: fromStatus },
      { $set: { status: toStatus } },
      { new: true }
    );
  },

  async updatePaymentStatus(orderId, paymentStatus) {
    return Order.findByIdAndUpdate(orderId, { $set: { paymentStatus } }, { new: true });
  },

  async appendStatusHistory({ orderId, fromStatus, toStatus, changedBy, note }) {
    return OrderStatusHistory.create({ orderId, fromStatus, toStatus, changedBy, note });
  },

  async findUnpaidOlderThan(thresholdDate) {
    return Order.find({
      status: { $in: [ORDER_STATUS.CREATED, ORDER_STATUS.PAYMENT_PENDING] },
      paymentStatus: 'PENDING',
      createdAt: { $lt: thresholdDate },
    })
      .limit(100)
      .lean();
  },
};
