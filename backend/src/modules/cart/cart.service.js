import { sessionClient } from '../../config/redis.js';
import { cacheKeys } from '../../cache/cacheKeys.js';
import { CART_TTL_SECONDS, CART_MAX_ITEMS } from './cart.constants.js';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError.js';
import { cartRepository } from './cart.repository.js';
import { productRepository } from '../products/product.repository.js';
import { toCartResponse, computeCartSummary } from './cart.mapper.js';
import { logger } from '../../common/utils/logger.js';

/**
 * Cart service.
 *
 * The ACTIVE cart is stored in Redis (`cart:{userId}`) because cart operations
 * are high-frequency and must be sub-millisecond. We ALSO persist a durable
 * copy to MongoDB in the background so a Redis eviction never loses a cart.
 */
export const cartService = {
  async getCart(userId) {
    let cart = await this._readRedis(userId);
    if (!cart) {
      // Fall back to the durable copy.
      const durable = await cartRepository.findByUser(userId);
      cart = durable ? durable.toObject() : null;
    }
    const summary = await this._withPrices(cart);
    return summary;
  },

  async addItem(userId, { productId, quantity, storeId }) {
    const product = await productRepository.findById(productId, {});
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundError('Product not available');
    }

    let cart = (await this._readRedis(userId)) || { userId, storeId: null, items: [] };

    // A cart can only contain products from one store at a time.
    if (storeId && cart.storeId && storeId !== String(cart.storeId)) {
      throw new BadRequestError('Cart contains items from another store');
    }
    cart.storeId = storeId || cart.storeId;

    const existing = cart.items.find((i) => String(i.productId) === String(productId));
    if (existing) {
      existing.quantity += quantity;
    } else {
      if (cart.items.length >= CART_MAX_ITEMS) throw new BadRequestError('Cart is full');
      cart.items.push({ productId, quantity, addedAt: new Date().toISOString(), unitPriceAtAdd: product.pricing.price });
    }

    await this._writeRedis(userId, cart);
    await this._persist(userId, cart);
    return this.getCart(userId);
  },

  async updateQuantity(userId, productId, quantity) {
    let cart = (await this._readRedis(userId)) || { userId, storeId: null, items: [] };
    const item = cart.items.find((i) => String(i.productId) === String(productId));
    if (!item) throw new NotFoundError('Item not in cart');

    if (quantity === 0) {
      cart.items = cart.items.filter((i) => String(i.productId) !== String(productId));
    } else {
      item.quantity = quantity;
    }

    await this._writeRedis(userId, cart);
    await this._persist(userId, cart);
    return this.getCart(userId);
  },

  async removeItem(userId, productId) {
    let cart = (await this._readRedis(userId)) || { userId, storeId: null, items: [] };
    cart.items = cart.items.filter((i) => String(i.productId) !== String(productId));
    await this._writeRedis(userId, cart);
    await this._persist(userId, cart);
    return this.getCart(userId);
  },

  async clear(userId) {
    await this._writeRedis(userId, { userId, storeId: null, items: [] });
    await cartRepository.clear(userId);
    return { cleared: true };
  },

  /** Read the raw cart (no pricing) — used by checkout. */
  async getRawCart(userId) {
    let cart = await this._readRedis(userId);
    if (!cart) {
      const durable = await cartRepository.findByUser(userId);
      cart = durable ? durable.toObject() : { userId, storeId: null, items: [] };
    }
    return cart;
  },

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------
  async _readRedis(userId) {
    const raw = await sessionClient.get(cacheKeys.cart(userId));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async _writeRedis(userId, cart) {
    await sessionClient.set(cacheKeys.cart(userId), JSON.stringify(cart), 'EX', CART_TTL_SECONDS);
  },

  /** Persist a durable copy to MongoDB (fire-and-forget). */
  async _persist(userId, cart) {
    try {
      await cartRepository.upsert(userId, { storeId: cart.storeId, items: cart.items });
    } catch (err) {
      logger.warn({ err, userId }, 'Failed to persist cart');
    }
  },

  /** Attach current prices + product metadata to cart items. */
  async _withPrices(cart) {
    const items = cart?.items || [];
    const productIds = items.map((i) => i.productId);
    const prices = {};
    if (productIds.length) {
      const products = await productRepository.findManyByIds(productIds);
      for (const p of products) {
        prices[p._id] = {
          price: p.pricing?.price,
          mrp: p.pricing?.mrp,
          name: p.name,
          image: p.images?.[0] || null,
          unit: p.unit,
        };
      }
    }
    return computeCartSummary(cart, prices);
  },
};
