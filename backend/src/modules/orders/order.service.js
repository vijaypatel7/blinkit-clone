import { generateOrderNumber } from '../../common/utils/index.js';
import { NotFoundError, ForbiddenError } from '../../common/errors/AppError.js';
import { ORDER_STATUS } from './order.constants.js';
import { assertTransition, canTransition } from './order.status.js';
import { orderRepository } from './order.repository.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { storeRepository } from '../stores/store.repository.js';
import { addressRepository } from '../addresses/address.repository.js';
import { toAddressResponse } from '../addresses/address.mapper.js';
import { toOrderResponse } from './order.mapper.js';
import { orderQueue, notificationQueue } from '../../queues/index.js';
import { logger } from '../../common/utils/logger.js';

/**
 * Order service.
 *
 * Order creation is the only transactional write on the checkout path; all
 * status changes go through the strict state machine in order.status.js.
 */
export const orderService = {
  /** Create an order (called by checkout after inventory is reserved). */
  async createOrder({
    userId,
    storeId,
    addressId,
    items,
    totals,
    paymentMethod,
    couponCode,
    notes,
    reservationId,
  }) {
    const order = await orderRepository.create({
      orderNumber: generateOrderNumber(),
      userId,
      storeId,
      addressId,
      items,
      totals,
      status: ORDER_STATUS.CREATED,
      paymentMethod,
      paymentStatus: 'PENDING',
      couponCode,
      notes,
      reservationId,
      delivery: { expectedBy: new Date(Date.now() + 30 * 60 * 1000) },
    });

    await orderRepository.appendStatusHistory({
      orderId: order._id,
      fromStatus: null,
      toStatus: ORDER_STATUS.CREATED,
      changedBy: 'system',
    });

    logger.info({ orderId: order._id, orderNumber: order.orderNumber }, 'Order created');
    return order;
  },

  /**
   * Enqueue everything that happens AFTER checkout (non-blocking).
   */
  async enqueuePostCheckout(order) {
    await orderQueue.add('order.confirmed', { orderId: order._id, userId: order.userId });
    // Schedule auto-cancel if the order stays unpaid.
    await orderQueue.add(
      'order.autoCancel',
      { orderId: order._id },
      { delay: 15 * 60 * 1000 } // 15 min
    );
  },

  async getOrder(userId, orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (String(order.userId) !== String(userId)) throw new ForbiddenError('Not your order');

    // Enrich with store location + delivery address so the confirmation page
    // can render a map and delivery details.
    const [store, address] = await Promise.all([
      storeRepository.findById(order.storeId),
      addressRepository.findById(order.addressId, userId),
    ]);

    return toOrderResponse(order, {
      store: store
        ? { name: store.name, address: store.address, coordinates: store.location?.coordinates || null }
        : null,
      address: toAddressResponse(address),
    });
  },

  async listByUser(userId, { limit, cursor, status } = {}) {
    const { items, nextCursor, hasMore } = await orderRepository.listByUser(userId, { limit, cursor });
    return { items: items.map(toOrderResponse), nextCursor, hasMore };
  },

  async listByStore(storeId, { status, limit, cursor } = {}) {
    const { items, nextCursor, hasMore } = await orderRepository.listByStore(storeId, { status, limit, cursor });
    return { items: items.map(toOrderResponse), nextCursor, hasMore };
  },

  /**
   * Transition an order to a new status, enforcing the state machine.
   */
  async transition(orderId, toStatus, { changedBy = 'system', note } = {}) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    assertTransition(order.status, toStatus);

    const updated = await orderRepository.transition(orderId, order.status, toStatus);
    if (!updated) {
      // Lost a concurrent transition race — re-validate.
      throw new NotFoundError('Order status changed concurrently, refresh and retry');
    }

    await orderRepository.appendStatusHistory({
      orderId,
      fromStatus: order.status,
      toStatus,
      changedBy,
      note,
    });

    // Side-effects (notifications) off the critical path.
    await orderQueue.add('order.statusChanged', {
      orderId,
      previousStatus: order.status,
      newStatus: toStatus,
    });

    return toOrderResponse(updated);
  },

  /**
   * Mark a payment as successful → order moves to CONFIRMED.
   */
  async markPaid(orderId) {
    const order = await orderRepository.updatePaymentStatus(orderId, 'SUCCESS');
    if (!order) throw new NotFoundError('Order not found');
    if (canTransition(order.status, ORDER_STATUS.CONFIRMED)) {
      await this.transition(orderId, ORDER_STATUS.CONFIRMED, { changedBy: 'system', note: 'Payment confirmed' });
    }
    return toOrderResponse(order);
  },

  /**
   * Cancel an order, releasing any reserved inventory.
   */
  async cancel(orderId, { reason, changedBy = 'user' } = {}) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (!canTransition(order.status, ORDER_STATUS.CANCELLED)) {
      throw new NotFoundError(`Order cannot be cancelled from ${order.status}`);
    }

    const updated = await orderRepository.transition(orderId, order.status, ORDER_STATUS.CANCELLED);
    if (!updated) throw new NotFoundError('Order status changed concurrently');

    await orderRepository.appendStatusHistory({
      orderId,
      fromStatus: order.status,
      toStatus: ORDER_STATUS.CANCELLED,
      changedBy,
      note: reason,
    });

    // Release reserved inventory.
    if (updated.reservationId) {
      for (const item of updated.items) {
        await inventoryService.releaseReservation({
          storeId: updated.storeId,
          productId: item.productId,
          quantity: item.quantity,
          referenceId: updated.reservationId,
        });
      }
    }

    return toOrderResponse(updated);
  },

  /** Auto-cancel an order that stayed unpaid past the timeout. */
  async autoCancelIfUnpaid(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) return null;
    if (
      order.paymentStatus === 'PENDING' &&
      canTransition(order.status, ORDER_STATUS.CANCELLED)
    ) {
      logger.info({ orderId }, 'Auto-cancelling unpaid order');
      return this.cancel(orderId, { reason: 'PAYMENT_TIMEOUT', changedBy: 'system' });
    }
    return null;
  },

  /** Emit a user notification on a status change (async). */
  async emitStatusNotification(orderId, status) {
    const order = await orderRepository.findById(orderId);
    if (!order) return;
    await notificationQueue.add('send', {
      channel: 'PUSH',
      userId: order.userId,
      template: 'ORDER_STATUS',
      data: { orderId, orderNumber: order.orderNumber, status },
    });
  },
};
