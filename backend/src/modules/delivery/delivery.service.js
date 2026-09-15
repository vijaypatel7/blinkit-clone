import { NotFoundError, BadRequestError } from '../../common/errors/AppError.js';
import { deliveryRepository } from './delivery.repository.js';
import { orderRepository } from '../orders/order.repository.js';
import { storeRepository } from '../stores/store.repository.js';
import { toDeliveryResponse } from './delivery.mapper.js';
import { ORDER_STATUS } from '../orders/order.constants.js';
import { orderService } from '../orders/order.service.js';
import { logger } from '../../common/utils/logger.js';

/**
 * Delivery service.
 */
export const deliveryService = {
  /** Create a delivery record for a newly confirmed order. */
  async createForOrder(orderId) {
    const existing = await deliveryRepository.findByOrder(orderId);
    if (existing) return toDeliveryResponse(existing);
    const delivery = await deliveryRepository.create({ orderId, status: 'UNASSIGNED' });
    return toDeliveryResponse(delivery);
  },

  /**
   * Assign the nearest online partner (called by the delivery worker).
   */
  async assignPartner(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    const store = await storeRepository.findById(order.storeId);
    const coords = store?.location?.coordinates || [72.5, 23.0];

    const partner = await deliveryRepository.findNearestPartner(coords);
    if (!partner) {
      logger.info({ orderId }, 'No online partner available, keeping unassigned');
      return null;
    }

    const delivery = await deliveryRepository.findByOrder(orderId);
    if (!delivery) throw new NotFoundError('Delivery record not found');

    await deliveryRepository.update(delivery._id, {
      deliveryPartnerId: partner.userId,
      status: 'ASSIGNED',
      assignedAt: new Date(),
    });

    // Move order to packing flow.
    if (order.status === ORDER_STATUS.CONFIRMED) {
      await orderService.transition(orderId, ORDER_STATUS.PACKING, { changedBy: 'system' });
    }

    return toDeliveryResponse(await deliveryRepository.findById(delivery._id));
  },

  /** Get delivery + recent tracking points for live tracking. */
  async getWithTracking(orderId) {
    const delivery = await deliveryRepository.findByOrder(orderId);
    if (!delivery) throw new NotFoundError('Delivery not found');
    const points = await deliveryRepository.listTracking(delivery._id);
    return {
      ...toDeliveryResponse(delivery),
      tracking: points.map((p) => ({
        coordinates: p.location?.coordinates,
        recordedAt: p.recordedAt,
      })),
    };
  },

  /** Append a tracking breadcrumb. */
  async appendTrackingPoint(deliveryId, { coordinates }) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new NotFoundError('Delivery not found');
    await deliveryRepository.appendTrackingPoint({ deliveryId, coordinates });
    return { recorded: true };
  },

  /** Mark a delivery as picked up / in transit / delivered. */
  async updateStatus(orderId, status, { coordinates } = {}) {
    const delivery = await deliveryRepository.findByOrder(orderId);
    if (!delivery) throw new NotFoundError('Delivery not found');

    const updates = { status };
    if (status === 'PICKED_UP') updates.pickedUpAt = new Date();
    if (status === 'DELIVERED') updates.deliveredAt = new Date();
    if (coordinates) {
      await deliveryRepository.appendTrackingPoint({ deliveryId: delivery._id, coordinates });
    }

    await deliveryRepository.update(delivery._id, updates);

    // Sync order status via the state machine.
    const statusToOrder = {
      PICKED_UP: ORDER_STATUS.READY_FOR_PICKUP,
      IN_TRANSIT: ORDER_STATUS.OUT_FOR_DELIVERY,
      DELIVERED: ORDER_STATUS.DELIVERED,
    };
    if (statusToOrder[status]) {
      const order = await orderRepository.findById(orderId);
      if (order && order.status !== statusToOrder[status]) {
        await orderService.transition(orderId, statusToOrder[status], { changedBy: 'system' });
      }
    }

    return toDeliveryResponse(await deliveryRepository.findById(delivery._id));
  },
};
