import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Unit tests — coupon discount computation (pure logic extracted for testability).
 */

/** Replicates the discount math in coupon.service.js without DB/Redis. */
function computeDiscount({ type, value, orderTotalPaise, minOrderValuePaise, maxDiscountPaise }) {
  if (orderTotalPaise < (minOrderValuePaise || 0)) return null;
  let discount;
  if (type === 'PERCENTAGE') discount = Math.floor((orderTotalPaise * value) / 100);
  else discount = value;
  if (maxDiscountPaise != null) discount = Math.min(discount, maxDiscountPaise);
  return Math.min(discount, orderTotalPaise);
}

test('percentage coupon applies correctly', () => {
  assert.equal(computeDiscount({ type: 'PERCENTAGE', value: 10, orderTotalPaise: 100000 }), 10000);
});

test('flat coupon is capped by maxDiscountPaise', () => {
  const d = computeDiscount({ type: 'FLAT', value: 5000, orderTotalPaise: 100000, maxDiscountPaise: 3000 });
  assert.equal(d, 3000);
});

test('coupon does not apply below min order value', () => {
  const d = computeDiscount({ type: 'FLAT', value: 5000, orderTotalPaise: 1000, minOrderValuePaise: 49900 });
  assert.equal(d, null);
});

test('discount never exceeds order total', () => {
  const d = computeDiscount({ type: 'FLAT', value: 999999, orderTotalPaise: 5000 });
  assert.equal(d, 5000);
});
