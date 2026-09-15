import { describe, it, expect } from 'vitest';
import { formatPaise, formatDate, truncate, clamp } from '../src/utils/index.js';

/**
 * Frontend unit tests — utility formatting.
 */
describe('formatPaise', () => {
  it('formats whole rupees without decimals', () => {
    expect(formatPaise(3200)).toBe('₹32');
  });

  it('formats fractional rupees with two decimals', () => {
    expect(formatPaise(3299)).toBe('₹32.99');
  });

  it('handles null/undefined', () => {
    expect(formatPaise(null)).toBe('₹0');
  });
});

describe('truncate', () => {
  it('truncates long strings with ellipsis', () => {
    expect(truncate('A very long product name here', 10)).toBe('A very lon…');
  });

  it('returns short strings unchanged', () => {
    expect(truncate('short')).toBe('short');
  });
});

describe('clamp', () => {
  it('clamps into range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('formatDate', () => {
  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });
});
