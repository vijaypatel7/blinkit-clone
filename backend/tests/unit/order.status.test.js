import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, assertTransition, allowedTransitions } from '../../src/modules/orders/order.status.js';
import { ORDER_STATUS } from '../../src/modules/orders/order.constants.js';

/**
 * Unit tests — the strict order state machine.
 */
test('CREATED can move to PAYMENT_PENDING or CANCELLED', () => {
  assert.equal(canTransition(ORDER_STATUS.CREATED, ORDER_STATUS.PAYMENT_PENDING), true);
  assert.equal(canTransition(ORDER_STATUS.CREATED, ORDER_STATUS.CANCELLED), true);
});

test('full happy-path flow is allowed', () => {
  const flow = [
    ORDER_STATUS.CREATED,
    ORDER_STATUS.PAYMENT_PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PACKING,
    ORDER_STATUS.READY_FOR_PICKUP,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
  ];
  for (let i = 0; i < flow.length - 1; i += 1) {
    assert.equal(canTransition(flow[i], flow[i + 1]), true, `${flow[i]} → ${flow[i + 1]}`);
  }
});

test('DELIVERED → CREATED is forbidden (no backwards transitions)', () => {
  assert.equal(canTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.CREATED), false);
});

test('terminal states have no outgoing transitions', () => {
  assert.deepEqual(allowedTransitions(ORDER_STATUS.DELIVERED), []);
  assert.deepEqual(allowedTransitions(ORDER_STATUS.CANCELLED), []);
});

test('assertTransition throws on illegal transition', () => {
  assert.throws(
    () => assertTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.CREATED),
    /Invalid order status transition/
  );
});

test('cancellation is allowed from early states only', () => {
  assert.equal(canTransition(ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED), true);
  assert.equal(canTransition(ORDER_STATUS.PACKING, ORDER_STATUS.CANCELLED), true);
  assert.equal(canTransition(ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.CANCELLED), false);
  assert.equal(canTransition(ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.CANCELLED), false);
});
