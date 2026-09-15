/**
 * Product constants.
 */
export const PRODUCT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
};

export const PRODUCT_SORT = {
  POPULARITY: 'popularity',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
};

/** Fields returned by listing endpoints (projection — keeps payloads small). */
export const PRODUCT_LIST_PROJECTION = {
  name: 1,
  slug: 1,
  sku: 1,
  brand: 1,
  categoryId: 1,
  images: 1,
  pricing: 1,
  status: 1,
  popularity: 1,
  createdAt: 1,
};

/** Fields returned by the detail endpoint. */
export const PRODUCT_DETAIL_PROJECTION = {
  name: 1,
  slug: 1,
  sku: 1,
  brand: 1,
  categoryId: 1,
  images: 1,
  pricing: 1,
  description: 1,
  attributes: 1,
  status: 1,
  popularity: 1,
  rating: 1,
  reviewCount: 1,
  createdAt: 1,
};
