/**
 * Checkout mappers.
 */
export function toQuoteResponse({ items, totals, store, deliveryEstimate, coupon }) {
  return {
    items,
    totals,
    store: store ? { id: store.id, name: store.name } : null,
    deliveryEstimate,
    coupon: coupon
      ? { code: coupon.code, discountPaise: coupon.discountPaise }
      : null,
  };
}
