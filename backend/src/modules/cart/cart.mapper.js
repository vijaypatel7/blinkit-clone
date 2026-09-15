/**
 * Cart mappers.
 */
export function toCartResponse(cart) {
  if (!cart) return { storeId: null, items: [], totalItems: 0, totalAmount: 0 };
  const items = cart.items || [];
  return {
    storeId: cart.storeId || null,
    items: items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      addedAt: i.addedAt,
    })),
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

/**
 * Compute a cart summary with pricing. `prices` is a map
 * productId → { price, mrp, name, image, unit }.
 */
export function computeCartSummary(cart, prices = {}) {
  const items = cart?.items || [];
  let totalMrp = 0;
  let totalAmount = 0;

  const detailedItems = items.map((item) => {
    const pricing = prices[item.productId] || {};
    const unitPrice = pricing.price ?? item.unitPriceAtAdd ?? 0;
    const unitMrp = pricing.mrp ?? unitPrice;
    const lineTotal = unitPrice * item.quantity;
    totalAmount += lineTotal;
    totalMrp += unitMrp * item.quantity;
    return {
      productId: item.productId,
      name: pricing.name,
      image: pricing.image || null,
      unit: pricing.unit,
      quantity: item.quantity,
      unitPrice,
      unitMrp,
      lineTotal,
    };
  });

  const discountPaise = Math.max(0, totalMrp - totalAmount);

  return {
    storeId: cart?.storeId || null,
    items: detailedItems,
    totalItems: detailedItems.reduce((s, i) => s + i.quantity, 0),
    totals: {
      totalMrp,
      totalAmount,
      discountPaise,
      deliveryFee: 0,
      platformFee: totalAmount > 0 ? 500 : 0,
      grandTotal: totalAmount + (totalAmount > 0 ? 500 : 0),
      savings: discountPaise,
    },
  };
}
