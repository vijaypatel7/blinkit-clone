/**
 * Coupon mappers.
 */
export function toCouponResponse(coupon) {
  if (!coupon) return null;
  const c = coupon.toObject ? coupon.toObject() : coupon;
  return {
    id: c._id,
    code: c.code,
    type: c.type,
    value: c.value,
    minOrderValuePaise: c.minOrderValuePaise,
    maxDiscountPaise: c.maxDiscountPaise,
    endsAt: c.endsAt,
  };
}
