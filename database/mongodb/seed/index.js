import mongoose from 'mongoose';
import { categories, stores, promotions, coupons } from './data.js';
import { generateProducts } from './products.js';
import { generateRealProducts } from './realProducts.js';

/**
 * Seed script — populates a fresh database with demo data.
 *
 * Usage:  MONGODB_URI=... node seed/index.js
 *
 * Idempotent: uses upserts keyed on natural keys (slug/sku/code) so it can be
 * re-run safely.
 */
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit';

async function seed() {
  await mongoose.connect(uri);
  const db = mongoose.connection;

  // 1. Categories
  const categoryIdBySlug = {};
  for (const cat of categories) {
    const doc = await db.collection('categories').findOneAndUpdate(
      { slug: cat.slug },
      { $set: { ...cat, status: 'ACTIVE' } },
      { upsert: true, returnDocument: 'after' }
    );
    categoryIdBySlug[cat.slug] = doc._id;
  }

  // Remove any category whose slug is no longer in the seed (e.g. renamed or
  // dropped categories from a previous run) so stale tiles don't linger.
  const seedSlugs = categories.map((c) => c.slug);
  const stale = await db.collection('categories').deleteMany({ slug: { $nin: seedSlugs } });
  if (stale.deletedCount > 0) {
    // eslint-disable-next-line no-console
    console.log('Removed stale categories:', stale.deletedCount);
  }

  // 2. Stores
  const storeIds = [];
  for (const store of stores) {
    const { coordinates, ...rest } = store;
    const doc = await db.collection('stores').findOneAndUpdate(
      { code: store.code },
      {
        $set: {
          ...rest,
          location: { type: 'Point', coordinates },
          status: 'ACTIVE',
          isDeliveryEnabled: true,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    storeIds.push(doc._id);
  }

  // 3. Products + inventory
  // Two sources of real Blinkit data, combined:
  //   - generateRealProducts(): the two scraped JSON files ("Snacks & Munchies"
  //     and "Masala, Oil & More") with complete name/unit/price/MRP.
  //   - generateProducts(): the PDF-derived catalog covering every other
  //     category (real names/images; prices estimated where the PDF omitted them).
  const realProducts = generateRealProducts();
  const pdfProducts = generateProducts();
  const products = [...realProducts, ...pdfProducts];
  let skipped = 0;
  for (const product of products) {
    const { categorySlug, mrp, price, image, ...rest } = product;
    const categoryId = categoryIdBySlug[categorySlug];
    if (!categoryId) {
      skipped += 1; // unknown category slug — skip safely
      continue;
    }
    const productDoc = await db.collection('products').findOneAndUpdate(
      { sku: product.sku },
      {
        $set: {
          ...rest,
          categoryId,
          pricing: { mrp, price, currency: 'INR' },
          images: image ? [image] : [],
          status: 'ACTIVE',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Seed inventory for each store.
    for (const storeId of storeIds) {
      await db.collection('inventory').updateOne(
        { storeId, productId: productDoc._id },
        { $setOnInsert: { availableQuantity: 100, reservedQuantity: 0, status: 'AVAILABLE' } },
        { upsert: true }
      );
    }
  }

  // 4. Promotions
  for (const promo of promotions) {
    await db.collection('promotions').findOneAndUpdate(
      { title: promo.title },
      { $set: { ...promo, status: 'ACTIVE' } },
      { upsert: true }
    );
  }

  // 5. Coupons
  for (const coupon of coupons) {
    await db.collection('coupons').findOneAndUpdate(
      { code: coupon.code },
      { $set: { ...coupon, status: 'ACTIVE' } },
      { upsert: true }
    );
  }

  // 6. Flush stale Redis cache (categories + home) so the re-seeded data shows
  // immediately instead of waiting for the backend's cache TTLs to expire.
  await flushRedisCache();

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    categories: categories.length,
    products: products.length,
    jsonProducts: realProducts.length,
    pdfProducts: pdfProducts.length,
    skippedProducts: skipped,
    stores: stores.length,
    promotions: promotions.length,
    coupons: coupons.length,
  });

  await mongoose.disconnect();
}

/**
 * Delete cached category/home/product/promotion keys from Redis (cache DB).
 * Fails fast (no infinite reconnect) and is a safe no-op if Redis is unreachable
 * — in that case the cache will simply expire on its own TTL.
 */
async function flushRedisCache() {
  try {
    const { default: Redis } = await import('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_DB_CACHE || 0),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2000,
      // Stop reconnecting after one retry so an unreachable Redis never hangs the seed.
      retryStrategy: (times) => (times > 1 ? null : 200),
    });
    await redis.connect();

    const patterns = ['categories:*', 'home:*', 'products:*', 'promotions:*', 'banners:*'];
    const keys = [];
    for (const pattern of patterns) {
      keys.push(...(await redis.keys(pattern)));
    }
    if (keys.length) {
      await redis.del(...keys);
      // eslint-disable-next-line no-console
      console.log('Flushed stale cache keys:', keys.length);
    }
    await redis.quit();
  } catch {
    // Redis unavailable — nothing to flush.
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
