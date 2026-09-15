/**
 * Delivery mappers.
 */
export function toDeliveryResponse(delivery) {
  if (!delivery) return null;
  const d = delivery.toObject ? delivery.toObject() : delivery;
  return {
    id: d._id,
    orderId: d.orderId,
    deliveryPartnerId: d.deliveryPartnerId,
    status: d.status,
    assignedAt: d.assignedAt,
    pickedUpAt: d.pickedUpAt,
    deliveredAt: d.deliveredAt,
    estimatedMinutes: d.estimatedMinutes,
  };
}
