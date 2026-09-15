/**
 * Deterministic seed data for local/dev environments.
 *
 * Categories, stores, promotions and coupons used to bootstrap a working demo.
 * Prices are in PAISE. The product catalog is real Blinkit data loaded by
 * `products.js` (PDF-derived, 1,834 items) and `realProducts.js` (two scraped
 * JSON files — snacks + masala — 464 items), combined in `index.js`.
 */

/**
 * The 20 categories shown on blinkit.com, in the same order, using Blinkit's
 * own category tile images (cdn.grofers.com).
 */
const CAT = 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/layout-engine';

export const categories = [
  { name: 'Paan Corner', slug: 'paan-corner', sortOrder: 1, icon: '🫒', image: `${CAT}/2022-12/paan-corner_web.png` },
  { name: 'Dairy, Bread & Eggs', slug: 'dairy-bread', sortOrder: 2, icon: '🥛', image: `${CAT}/2022-11/Slice-2_10.png` },
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', sortOrder: 3, icon: '🥬', image: `${CAT}/2022-11/Slice-3_9.png` },
  { name: 'Cold Drinks & Juices', slug: 'beverages', sortOrder: 4, icon: '🥤', image: `${CAT}/2022-11/Slice-4_9.png` },
  { name: 'Snacks & Munchies', slug: 'snacks', sortOrder: 5, icon: '🍿', image: `${CAT}/2022-11/Slice-5_4.png` },
  { name: 'Breakfast & Instant Food', slug: 'instant-frozen', sortOrder: 6, icon: '🍜', image: `${CAT}/2022-11/Slice-6_5.png` },
  { name: 'Sweet Tooth', slug: 'ice-cream', sortOrder: 7, icon: '🍦', image: `${CAT}/2022-11/Slice-7_3.png` },
  { name: 'Bakery & Biscuits', slug: 'biscuits-cookies', sortOrder: 8, icon: '🍪', image: `${CAT}/2022-11/Slice-8_4.png` },
  { name: 'Tea, Coffee & Health Drink', slug: 'tea-coffee', sortOrder: 9, icon: '☕', image: `${CAT}/2025-11/Slice-7-1_0.png` },
  { name: 'Atta, Rice & Dal', slug: 'staples', sortOrder: 10, icon: '🌾', image: `${CAT}/2022-11/Slice-10.png` },
  { name: 'Masala, Oil & More', slug: 'oils-ghee', sortOrder: 11, icon: '🫙', image: `${CAT}/2022-11/Slice-11.png` },
  { name: 'Sauces & Spreads', slug: 'sauces-spreads', sortOrder: 12, icon: '🥫', image: `${CAT}/2022-11/Slice-12.png` },
  { name: 'Chicken, Meat & Fish', slug: 'eggs-meat', sortOrder: 13, icon: '🥚', image: `${CAT}/2022-11/Slice-13.png` },
  { name: 'Organic & Healthy Living', slug: 'health-wellness', sortOrder: 14, icon: '🥗', image: `${CAT}/2022-11/Slice-14.png` },
  { name: 'Baby Care', slug: 'baby-care', sortOrder: 15, icon: '🍼', image: `${CAT}/2022-11/Slice-15.png` },
  { name: 'Pharma & Wellness', slug: 'pharma-wellness', sortOrder: 16, icon: '💊', image: `${CAT}/2022-11/Slice-16.png` },
  { name: 'Cleaning Essentials', slug: 'household', sortOrder: 17, icon: '🧹', image: `${CAT}/2022-11/Slice-17.png` },
  { name: 'Home & Office', slug: 'home-office', sortOrder: 18, icon: '🏠', image: `${CAT}/2022-11/Slice-18.png` },
  { name: 'Personal Care', slug: 'personal-care', sortOrder: 19, icon: '🧴', image: `${CAT}/2022-11/Slice-19.png` },
  { name: 'Pet Care', slug: 'pet-care', sortOrder: 20, icon: '🐾', image: `${CAT}/2022-11/Slice-20.png` },
];

export const stores = [
  {
    name: 'Blinkit Store — CG Road',
    code: 'ST-AHM-001',
    address: { line1: 'CG Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' },
    coordinates: [72.5469, 23.0225], // [lng, lat]
    deliveryRadiusMeters: 8000,
  },
  {
    name: 'Blinkit Store — Satellite',
    code: 'ST-AHM-002',
    address: { line1: 'Satellite Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
    coordinates: [72.5189, 23.0368],
    deliveryRadiusMeters: 8000,
  },
];

export const promotions = [
  { title: 'Big Savings on Dairy!', type: 'BANNER', description: 'Up to 20% off', priority: 10 },
  { title: 'Free delivery above ₹199', type: 'OFFER', description: 'Limited time', priority: 5 },
  { title: 'Snacks Fest', type: 'CAROUSEL', description: 'Buy 1 get 1', priority: 8 },
];

export const coupons = [
  { code: 'WELCOME50', type: 'FLAT', value: 5000, minOrderValuePaise: 49900, maxUsesPerUser: 1 },
  { code: 'SAVE10', type: 'PERCENTAGE', value: 10, maxDiscountPaise: 10000, minOrderValuePaise: 99900 },
];
