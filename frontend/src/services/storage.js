/**
 * Typed localStorage wrapper (with JSON serialization + in-memory fallback).
 */
const memoryStore = new Map();

const isAvailable = typeof window !== 'undefined' && !!window.localStorage;

export const storage = {
  get(key, fallback = null) {
    if (!isAvailable) return memoryStore.has(key) ? memoryStore.get(key) : fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    if (!isAvailable) {
      memoryStore.set(key, value);
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode */
    }
  },

  remove(key) {
    if (!isAvailable) {
      memoryStore.delete(key);
      return;
    }
    localStorage.removeItem(key);
  },
};

/** Namespaced keys used across the app. */
export const storageKeys = {
  AUTH_TOKEN: 'blinkit.token',
  REFRESH_TOKEN: 'blinkit.refreshToken',
  AUTH_EXPIRES_AT: 'blinkit.tokenExpiresAt', // ms timestamp of access-token expiry
  USER: 'blinkit.user',
  CART: 'blinkit.cart', // optimistic cart for guests
  WISHLIST: 'blinkit.wishlist', // client-side wishlist
  RECENT_SEARCHES: 'blinkit.recentSearches',
  DELIVERY_LOCATION: 'blinkit.deliveryLocation',
};
