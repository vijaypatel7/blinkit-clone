/**
 * Frontend constants.
 */
export const CURRENCY_SYMBOL = '₹';

export const PAYMENT_METHODS = ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'COD'];

export const ORDER_STATUS_LABELS = {
  CREATED: 'Order placed',
  PAYMENT_PENDING: 'Payment pending',
  CONFIRMED: 'Confirmed',
  PACKING: 'Packing',
  READY_FOR_PICKUP: 'Ready for pickup',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_FLOW = [
  'CREATED',
  'CONFIRMED',
  'PACKING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const FREE_DELIVERY_THRESHOLD_PAISE = 19900;

/** Indian mobile: 10 digits starting 6–9 (optional +91). */
export const MOBILE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;

/**
 * Category images — the REAL Blinkit category tiles (cdn.grofers.com), keyed by
 * category slug so the home page looks identical to blinkit.com.
 */
const CATEGORY_IMG_BASE =
  'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/layout-engine';

export const CATEGORY_IMAGES = {
  'paan-corner': `${CATEGORY_IMG_BASE}/2022-12/paan-corner_web.png`,
  'dairy-bread': `${CATEGORY_IMG_BASE}/2022-11/Slice-2_10.png`,
  'fruits-vegetables': `${CATEGORY_IMG_BASE}/2022-11/Slice-3_9.png`,
  beverages: `${CATEGORY_IMG_BASE}/2022-11/Slice-4_9.png`,
  snacks: `${CATEGORY_IMG_BASE}/2022-11/Slice-5_4.png`,
  'instant-frozen': `${CATEGORY_IMG_BASE}/2022-11/Slice-6_5.png`,
  'ice-cream': `${CATEGORY_IMG_BASE}/2022-11/Slice-7_3.png`,
  'biscuits-cookies': `${CATEGORY_IMG_BASE}/2022-11/Slice-8_4.png`,
  'tea-coffee': `${CATEGORY_IMG_BASE}/2025-11/Slice-7-1_0.png`,
  staples: `${CATEGORY_IMG_BASE}/2022-11/Slice-10.png`,
  'oils-ghee': `${CATEGORY_IMG_BASE}/2022-11/Slice-11.png`,
  'sauces-spreads': `${CATEGORY_IMG_BASE}/2022-11/Slice-12.png`,
  'eggs-meat': `${CATEGORY_IMG_BASE}/2022-11/Slice-13.png`,
  'health-wellness': `${CATEGORY_IMG_BASE}/2022-11/Slice-14.png`,
  'baby-care': `${CATEGORY_IMG_BASE}/2022-11/Slice-15.png`,
  'pharma-wellness': `${CATEGORY_IMG_BASE}/2022-11/Slice-16.png`,
  household: `${CATEGORY_IMG_BASE}/2022-11/Slice-17.png`,
  'home-office': `${CATEGORY_IMG_BASE}/2022-11/Slice-18.png`,
  'personal-care': `${CATEGORY_IMG_BASE}/2022-11/Slice-19.png`,
  'pet-care': `${CATEGORY_IMG_BASE}/2022-11/Slice-20.png`,
};

/** Resolve a category's image (backend `image` field first, then this map). */
export function categoryImage(category) {
  return category?.image || CATEGORY_IMAGES[category?.slug] || null;
}

/** Hero banner carousel — the live Blinkit masthead images. */
export const HOME_BANNERS = [
  {
    id: 'fnv',
    title: 'Fruits & Vegetables',
    image:
      'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=2700/layout-engine/2026-01/Frame-1437256605-2-2.jpg',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    image:
      'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2023-07/pharmacy-WEB.jpg',
  },
  {
    id: 'pet-care',
    title: 'Pet Care',
    image:
      'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2026-01/pet_crystal_WEB-1.png',
  },
  {
    id: 'baby-care',
    title: 'Baby Care',
    image:
      'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2026-01/baby_crystal_WEB-1.png',
  },
];

/** Preset delivery locations for the location picker (no backend needed). */
export const PRESET_LOCATIONS = [
  { label: 'CG Road, Ahmedabad', lat: 23.0225, lng: 72.5469 },
  { label: 'Satellite, Ahmedabad', lat: 23.0368, lng: 72.5189 },
  { label: 'Maninagar, Ahmedabad', lat: 22.9985, lng: 72.5995 },
  { label: 'Bopal, Ahmedabad', lat: 23.0337, lng: 72.4656 },
  { label: 'Vastrapur, Ahmedabad', lat: 23.0374, lng: 72.5284 },
  { label: 'Mumbai (Bandra)', lat: 19.0596, lng: 72.8295 },
  { label: 'Bengaluru (Indiranagar)', lat: 12.9719, lng: 77.6412 },
  { label: 'Delhi (Connaught Place)', lat: 28.6304, lng: 77.2177 },
  { label: 'Pune (Kothrud)', lat: 18.5074, lng: 73.8077 },
  { label: 'Hyderabad (Hitech City)', lat: 17.4483, lng: 78.3915 },
];

/** Footer link groups (Blinkit-style). */
export const FOOTER_LINKS = {
  'Useful Links': ['About', 'Careers', 'Blog', 'Press', 'Lead', 'Value'],
  'Partner With Us': ['Sell on blinkit', 'Become a delivery partner', 'Franchise'],
  Company: ['Terms & Conditions', 'Privacy Policy', 'Refund Policy', 'FAQs'],
};
