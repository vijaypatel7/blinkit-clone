import { ORDER_STATUS } from './order.constants.js';
import { BadRequestError } from '../../common/errors/AppError.js';

/**
 * Strict order state machine.
 *
 * Only these transitions are allowed. Any attempt to move an order illegally
 * (e.g. DELIVERED → CREATED) is rejected. This is the single source of truth
 * for order lifecycle rules.
 *
 *   CREATED ────────────► PAYMENT_PENDING
 *     │                        │
 *     │                        ▼
 *     │                    CONFIRMED
 *     │                        │
 *     │                        ▼
 *     │                     PACKING
 *     │                        │
 *     │                        ▼
 *     │                 READY_FOR_PICKUP
 *     │                        │
 *     │                        ▼
 *     │                 OUT_FOR_DELIVERY
 *     │                        │
 *     │                        ▼
 *     │                    DELIVERED
 *     │
 *     └──► CANCELLED (from CREATED, PAYMENT_PENDING, CONFIRMED, PACKING)
 */
const TRANSITIONS = {
  [ORDER_STATUS.CREATED]: [ORDER_STATUS.PAYMENT_PENDING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAYMENT_PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PACKING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PACKING]: [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY_FOR_PICKUP]: [ORDER_STATUS.OUT_FOR_DELIVERY],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
  // Terminal states:
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

/** Returns true if the transition is legal. */
export function canTransition(fromStatus, toStatus) {
  const allowed = TRANSITIONS[fromStatus];
  return Array.isArray(allowed) && allowed.includes(toStatus);
}

/** Assert a transition is legal, else throw a 400. */
export function assertTransition(fromStatus, toStatus) {
  if (!canTransition(fromStatus, toStatus)) {
    throw new BadRequestError(
      `Invalid order status transition: ${fromStatus} → ${toStatus}`,
      { fromStatus, toStatus }
    );
  }
}

/** List all allowed target states for a given current state. */
export function allowedTransitions(fromStatus) {
  return TRANSITIONS[fromStatus] || [];
}

export { ORDER_STATUS as ORDER_STATES };
