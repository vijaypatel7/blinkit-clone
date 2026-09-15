/**
 * Shared domain constants (enums). Module-specific constants live inside each
 * module's `*.constants.js`; these are the cross-cutting ones.
 */

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  STORE_MANAGER: 'STORE_MANAGER',
  ADMIN: 'ADMIN',
};

export const PAYMENT_METHODS = {
  CARD: 'CARD',
  UPI: 'UPI',
  NET_BANKING: 'NET_BANKING',
  WALLET: 'WALLET',
  COD: 'COD',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
};

export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
};

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
};

export const HTTP_HEADERS = {
  IDEMPOTENCY_KEY: 'idempotency-key',
  REQUEST_ID: 'x-request-id',
  AUTH: 'authorization',
};
