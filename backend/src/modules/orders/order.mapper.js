/**
 * Order mappers.
 */
export function toOrderResponse(order, { store, address } = {}) {
  if (!order) return null;
  const o = order.toObject ? order.toObject() : order;
  return {
    id: o._id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      unitMrp: i.unitMrp,
      lineTotal: i.lineTotal,
    })),
    totals: o.totals,
    storeId: o.storeId,
    addressId: o.addressId,
    // Enriched store/address (used by the order confirmation page for the map).
    store: store || null,
    address: address || null,
    couponCode: o.couponCode,
    notes: o.notes,
    delivery: o.delivery,
    cancellation: o.cancellation,
    createdAt: o.createdAt,
  };
}
