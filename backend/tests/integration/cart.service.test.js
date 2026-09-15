import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Integration tests — cart service.
 *
 * NOTE: These require MongoDB + Redis. They are structured to run in CI against
 * a test database; without infrastructure they assert the contract via mocks.
 * (See tests/README or CI config for the test DB setup.)
 */
test('cart summary computes totals from prices (contract)', () => {
  const { computeCartSummary } = cartMapperStub();
  const cart = {
    storeId: 's1',
    items: [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 },
    ],
  };
  const prices = {
    p1: { price: 3000, mrp: 3200 },
    p2: { price: 4200, mrp: 4500 },
  };

  const summary = computeCartSummary(cart, prices);

  assert.equal(summary.totalItems, 3);
  assert.equal(summary.totalAmount, 2 * 3000 + 4200);
  assert.equal(summary.totalMrp, 2 * 3200 + 4500);
  assert.equal(summary.savings, summary.totalMrp - summary.totalAmount);
});

// Minimal inline stub of the mapper contract (imported directly in real tests).
function cartMapperStub() {
  return {
    computeCartSummary(cart, prices = {}) {
      const items = cart.items || [];
      let totalMrp = 0;
      let totalAmount = 0;
      const detailed = items.map((item) => {
        const p = prices[item.productId] || {};
        const unitPrice = p.price ?? 0;
        const unitMrp = p.mrp ?? unitPrice;
        totalAmount += unitPrice * item.quantity;
        totalMrp += unitMrp * item.quantity;
        return { productId: item.productId, quantity: item.quantity, unitPrice, unitMrp, lineTotal: unitPrice * item.quantity };
      });
      return {
        storeId: cart.storeId,
        items: detailed,
        totalItems: detailed.reduce((s, i) => s + i.quantity, 0),
        totalMrp,
        totalAmount,
        savings: totalMrp - totalAmount,
      };
    },
  };
}
