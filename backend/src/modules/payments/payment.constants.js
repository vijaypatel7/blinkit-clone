/**
 * Payment constants.
 */
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
};

export const PAYMENT_TXN_TYPE = {
  AUTHORIZE: 'AUTHORIZE',
  CAPTURE: 'CAPTURE',
  REFUND: 'REFUND',
  FAILURE: 'FAILURE',
};

/** Mock gateway states (replace with a real provider in production). */
export const GATEWAY_STATES = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};
