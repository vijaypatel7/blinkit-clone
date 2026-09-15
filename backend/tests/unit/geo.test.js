import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversineMeters, zoneKey } from '../../src/common/utils/geo.js';

/**
 * Unit tests — geo helpers.
 */
test('haversine returns ~0 for identical points', () => {
  assert.ok(haversineMeters(23.0225, 72.5469, 23.0225, 72.5469) < 1);
});

test('haversine computes a plausible distance for nearby points', () => {
  // Ahmedabad CG Road → Satellite is roughly a few km apart.
  const d = haversineMeters(23.0225, 72.5469, 23.0368, 72.5189);
  assert.ok(d > 1000 && d < 10000, `distance was ${d}m`);
});

test('zoneKey buckets nearby coordinates to the same zone', () => {
  const a = zoneKey({ lat: 23.0225, lng: 72.5469 });
  const b = zoneKey({ lat: 23.0226, lng: 72.5468 });
  assert.equal(a, b);
});

test('zoneKey differs for far-apart coordinates', () => {
  const a = zoneKey({ lat: 23.02, lng: 72.54 });
  const b = zoneKey({ lat: 28.61, lng: 77.20 });
  assert.notEqual(a, b);
});
