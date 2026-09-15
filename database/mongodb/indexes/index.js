import mongoose from 'mongoose';

/**
 * Index registry + apply script.
 *
 * Indexes are THE most important factor for p99 latency. Every index below is
 * mapped to a specific query in the application. Run this once (and after any
 * schema change) to create/ensure indexes.
 *
 * Usage:  MONGODB_URI=... node indexes/index.js
 */
const INDEXES = {
  users: [
    { keys: { phone: 1 }, options: { unique: true, name: 'idx_users_phone' } },
    { keys: { email: 1 }, options: { unique: true, sparse: true, name: 'idx_users_email' } },
    { keys: { role: 1, isActive: 1 }, options: { name: 'idx_users_role_active' } },
  ],
  addresses: [
    { keys: { userId: 1, isDefault: 1 }, options: { name: 'idx_addresses_user_default' } },
    { keys: { location: '2dsphere' }, options: { name: 'idx_addresses_geo' } },
  ],
  stores: [
    { keys: { location: '2dsphere' }, options: { name: 'idx_stores_geo' } },
    { keys: { status: 1, isDeliveryEnabled: 1 }, options: { name: 'idx_stores_status_delivery' } },
  ],
  store_zones: [
    { keys: { storeId: 1 }, options: { name: 'idx_zones_store' } },
    { keys: { boundary: '2dsphere' }, options: { name: 'idx_zones_geo' } },
    { keys: { pincodes: 1 }, options: { name: 'idx_zones_pincodes' } },
  ],
  categories: [
    { keys: { slug: 1 }, options: { unique: true, name: 'idx_categories_slug' } },
    { keys: { parentId: 1, sortOrder: 1 }, options: { name: 'idx_categories_parent' } },
  ],
  products: [
    { keys: { sku: 1 }, options: { unique: true, name: 'idx_products_sku' } },
    { keys: { slug: 1 }, options: { unique: true, name: 'idx_products_slug' } },
    { keys: { categoryId: 1, status: 1 }, options: { name: 'idx_products_category_status' } },
    { keys: { brand: 1, status: 1 }, options: { name: 'idx_products_brand_status' } },
    { keys: { status: 1, popularity: -1 }, options: { name: 'idx_products_popular' } },
  ],
  inventory: [
    { keys: { storeId: 1, productId: 1 }, options: { unique: true, name: 'idx_inventory_store_product' } },
    { keys: { storeId: 1, status: 1 }, options: { name: 'idx_inventory_store_status' } },
    { keys: { productId: 1, storeId: 1 }, options: { name: 'idx_inventory_product_store' } },
  ],
  inventory_transactions: [
    { keys: { inventoryId: 1, createdAt: -1 }, options: { name: 'idx_inv_txn_inventory' } },
    { keys: { productId: 1, createdAt: -1 }, options: { name: 'idx_inv_txn_product' } },
  ],
  carts: [{ keys: { userId: 1, updatedAt: -1 }, options: { name: 'idx_carts_user' } }],
  orders: [
    { keys: { orderNumber: 1 }, options: { unique: true, name: 'idx_orders_number' } },
    { keys: { userId: 1, createdAt: -1 }, options: { name: 'idx_orders_user_created' } },
    { keys: { storeId: 1, status: 1 }, options: { name: 'idx_orders_store_status' } },
    { keys: { paymentStatus: 1 }, options: { name: 'idx_orders_payment' } },
  ],
  order_status_history: [
    { keys: { orderId: 1, createdAt: 1 }, options: { name: 'idx_osh_order' } },
  ],
  payments: [
    { keys: { orderId: 1, createdAt: -1 }, options: { name: 'idx_payments_order' } },
    { keys: { status: 1 }, options: { name: 'idx_payments_status' } },
  ],
  payment_transactions: [
    { keys: { paymentId: 1, createdAt: -1 }, options: { name: 'idx_pay_txn_payment' } },
    { keys: { orderId: 1 }, options: { name: 'idx_pay_txn_order' } },
  ],
  deliveries: [
    { keys: { orderId: 1 }, options: { unique: true, name: 'idx_deliveries_order' } },
    { keys: { deliveryPartnerId: 1, status: 1 }, options: { name: 'idx_deliveries_partner_status' } },
  ],
  delivery_partners: [
    { keys: { currentLocation: '2dsphere' }, options: { name: 'idx_partners_geo' } },
    { keys: { isOnline: 1 }, options: { name: 'idx_partners_online' } },
  ],
  delivery_tracking: [
    { keys: { deliveryId: 1, recordedAt: -1 }, options: { name: 'idx_tracking_delivery' } },
  ],
  promotions: [
    { keys: { status: 1, priority: -1 }, options: { name: 'idx_promotions_status_priority' } },
    { keys: { startsAt: 1, endsAt: 1 }, options: { name: 'idx_promotions_window' } },
  ],
  coupons: [
    { keys: { code: 1 }, options: { unique: true, name: 'idx_coupons_code' } },
    { keys: { status: 1 }, options: { name: 'idx_coupons_status' } },
  ],
  reviews: [
    { keys: { productId: 1, status: 1, createdAt: -1 }, options: { name: 'idx_reviews_product' } },
    { keys: { userId: 1, productId: 1 }, options: { unique: true, name: 'idx_reviews_user_product' } },
  ],
  wishlists: [{ keys: { userId: 1 }, options: { unique: true, name: 'idx_wishlists_user' } }],
  notifications: [
    { keys: { userId: 1, sentAt: -1 }, options: { name: 'idx_notifications_user' } },
    { keys: { userId: 1, isRead: 1 }, options: { name: 'idx_notifications_unread' } },
  ],
  audit_logs: [
    { keys: { createdAt: -1 }, options: { name: 'idx_audit_created' } },
    { keys: { actorId: 1, createdAt: -1 }, options: { name: 'idx_audit_actor' } },
  ],
};

/** Apply all indexes. */
export async function applyIndexes(connection) {
  const results = [];
  for (const [collectionName, indexes] of Object.entries(INDEXES)) {
    const collection = connection.collection(collectionName);
    for (const { keys, options } of indexes) {
      try {
        const name = await collection.createIndex(keys, options);
        results.push({ collection: collectionName, index: name });
      } catch (err) {
        results.push({ collection: collectionName, error: err.message });
      }
    }
  }
  return results;
}

// CLI entry point.
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit';
  await mongoose.connect(uri);
  const results = await applyIndexes(mongoose.connection);
  // eslint-disable-next-line no-console
  console.table(results);
  await mongoose.disconnect();
}
