import { env } from './environment.js';

/**
 * Central place for performance / caching tunables.
 *
 * Keeping every TTL and threshold here (instead of sprinkled through the code)
 * makes it easy to tune the system from one place after load tests.
 */

/** TTLs (seconds) — Redis cache. */
export const CACHE_TTL = {
  /** Product detail — changes rarely. */
  PRODUCT: 5 * 60, // 5 min
  /** Product listing — short enough to reflect price/stock edits. */
  PRODUCT_LIST: 3 * 60, // 3 min
  /** Categories — very stable. */
  CATEGORY: 30 * 60, // 30 min
  /** Precomputed home page payload. */
  HOME: 2 * 60, // 2 min
  /** Store information. */
  STORE: 15 * 60, // 15 min
  /** Inventory availability — MUST be short to avoid overselling UX. */
  INVENTORY: 15, // 15 seconds
  /** Promotions / banners. */
  PROMOTION: 60, // 1 min
  /** Popular / trending products. */
  POPULAR: 5 * 60,
  /** User → serviceable store mapping. */
  USER_STORE: 10 * 60,
  /** Search results — short. */
  SEARCH: 60,
};

/** How long to keep a cache write-waiting lock (prevents cache stampede). */
export const CACHE_LOCK_TTL = 5; // seconds

/** p99 latency budget (ms) we aim to stay under for cached reads. */
export const P99_BUDGET_MS = 50;

/** Max items returned by any list endpoint without explicit pagination. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Geo defaults. */
export const GEO = {
  defaultSearchRadiusMeters: env.delivery.defaultSearchRadiusMeters,
  maxDeliveryDistanceMeters: env.delivery.maxDeliveryDistanceMeters,
};

/** Order timeout before an unpaid order is auto-cancelled (ms). */
export const ORDER_PAYMENT_TIMEOUT_MS = 15 * 60 * 1000;

/** How long an inventory reservation stays valid before release (ms). */
export const INVENTORY_RESERVATION_TTL_MS = 10 * 60 * 1000;
