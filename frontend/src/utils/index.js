/**
 * Small formatting / helper utilities.
 */
import { CURRENCY_SYMBOL } from '../constants/index.js';

/** Format paise (integer) as a rupee string, e.g. 3200 → "₹32". */
export function formatPaise(paise) {
  if (paise == null) return `${CURRENCY_SYMBOL}0`;
  const rupees = paise / 100;
  return `${CURRENCY_SYMBOL}${rupees % 1 === 0 ? rupees.toFixed(0) : rupees.toFixed(2)}`;
}

/** Format a date as a short, human string. */
export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format a relative time, e.g. "5 min ago". */
export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return formatDate(iso);
}

/** Truncate a string with an ellipsis. */
export function truncate(str, length = 40) {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length).trimEnd()}…`;
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Build an image src with a sensible placeholder fallback. */
export function imageUrl(url, fallback = '/placeholder.svg') {
  return url || fallback;
}
