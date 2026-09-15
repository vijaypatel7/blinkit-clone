/**
 * Small, dependency-free helpers.
 */
import { randomInt } from 'node:crypto';

/** Generate a numeric OTP (6 digits). */
export function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return randomInt(min, max).toString();
}

/** Generate a human-readable order number, e.g. BLK-20260831-A1B2C3. */
export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = randomInt(0, 0xffffff).toString(16).toUpperCase().padStart(6, '0');
  return `BLK-${date}-${rand}`;
}

/** Generate a short unique id (used for reference ids / slugs). */
export function shortId(prefix = '', length = 12) {
  const rand = randomInt(0, 36 ** length).toString(36).padStart(length, '0');
  return prefix ? `${prefix}_${rand}` : rand;
}

/** Sleep helper for retries. */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Deep-freeze an object (useful for shared constants). */
export function deepFreeze(obj) {
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return obj;
}
