/**
 * Central registry of every cache key pattern.
 *
 * Keeping all keys in one file prevents two modules from accidentally sharing
 * a key and lets us invalidate keys by pattern consistently.
 */
export const cacheKeys = {
  // Products
  product: (productId) => `product:${productId}`,
  productAtStore: (productId, storeId) => `product:${productId}:store:${storeId}`,
  productList: (queryHash) => `products:list:${queryHash}`,
  productBySlug: (slug) => `product:slug:${slug}`,

  // Categories
  category: (categoryId) => `category:${categoryId}`,
  categoryTree: () => 'categories:tree',
  categoriesByParent: (parentId) => `categories:parent:${parentId || 'root'}`,
  categoryProducts: (categoryId) => `category:${categoryId}:products`,

  // Stores
  store: (storeId) => `store:${storeId}`,
  storeInventory: (storeId) => `store:${storeId}:inventory`,
  storesByZone: (zone) => `stores:zone:${zone}`,
  nearestStore: (zone) => `stores:nearest:${zone}`,

  // Home page (precomputed per location zone)
  home: (zone) => `home:${zone}`,

  // Inventory
  inventory: (storeId, productId) => `inventory:${storeId}:${productId}`,

  // Promotions / offers
  promotion: (promotionId) => `promotion:${promotionId}`,
  activePromotions: () => 'promotions:active',
  banners: (zone) => `banners:${zone}`,

  // Popular / trending
  popularProducts: (zone) => `products:popular:${zone}`,

  // User
  userStore: (userId) => `user:${userId}:store`,
  user: (userId) => `user:${userId}`,
  cart: (userId) => `cart:${userId}`,

  // Auth / OTP / rate limit
  otp: (phone, purpose) => `otp:${purpose}:${phone}`,
  session: (sessionId) => `session:${sessionId}`,
  rateLimit: (identifier, route) => `rl:${identifier}:${route}`,

  // Search
  search: (queryHash) => `search:${queryHash}`,
};
