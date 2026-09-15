import { BadRequestError, NotFoundError, InsufficientStockError } from '../../common/errors/AppError.js';
import { cartService } from '../cart/cart.service.js';
import { addressService } from '../addresses/address.service.js';
import { productRepository } from '../products/product.repository.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { orderService } from '../orders/order.service.js';
import { couponService } from '../coupons/coupon.service.js';
import { storeService } from '../stores/store.service.js';
import { PAYMENT_METHODS } from '../../common/constants/index.js';
import { toQuoteResponse } from './checkout.mapper.js';

/**
 * Checkout service.
 *
 * The critical path is intentionally SHORT:
 *   validate cart → validate inventory → reserve stock → create order → return.
 * Everything else (notifications, delivery assignment, analytics) is enqueued.
 *
 * We never trust prices from the frontend — we re-fetch them from the DB.
 */
export const checkoutService = {
  /**
   * Produce a price quote (totals) without mutating anything.
   * This is what the UI shows on the checkout page.
   */
  async quote(userId, { addressId, couponCode, items }) {
    const cartItems = await this._resolveCartItems(userId, items);
    if (!cartItems.length) throw new BadRequestError('Cart is empty');

    const address = await this._getAddress(userId, addressId);
    const store = await this._resolveStoreForAddress(address);

    // Re-fetch authoritative prices.
    const prices = await this._fetchPrices(cartItems);
    const totals = await this._computeTotals(cartItems, prices, couponCode, userId);

    return toQuoteResponse({
      items: totals.items,
      totals: totals.totals,
      store,
      deliveryEstimate: { minutes: 15, date: new Date() },
      coupon: totals.coupon,
    });
  },

  /**
   * Execute checkout: reserve inventory atomically and create the order.
   */
  async checkout(userId, { addressId, paymentMethod, couponCode, notes, items }) {
    // 1. Validate cart (client items or server cart).
    const cartItems = await this._resolveCartItems(userId, items);
    if (!cartItems.length) throw new BadRequestError('Cart is empty');

    // 2. Validate address + resolve store.
    const address = await this._getAddress(userId, addressId);
    const store = await this._resolveStoreForAddress(address);

    // 3. Fetch authoritative prices (NEVER trust client prices).
    const prices = await this._fetchPrices(cartItems);
    const totals = await this._computeTotals(cartItems, prices, couponCode, userId);

    // 4. Atomically reserve stock for every line item.
    const reservationId = `res-${Date.now()}-${userId.slice(-6)}`;
    for (const item of totals.items) {
      try {
        await inventoryService.reserve({
          storeId: store.id,
          productId: item.productId,
          quantity: item.quantity,
          referenceId: reservationId,
        });
      } catch (err) {
        if (err instanceof InsufficientStockError) {
          // Roll back any items already reserved for this checkout.
          await this._rollbackReservations(totals.items, store.id, reservationId, item.productId);
          throw err;
        }
        throw err;
      }
    }

    // 5. Create the order (the only transactional state on this path).
    const order = await orderService.createOrder({
      userId,
      storeId: store.id,
      addressId,
      items: totals.items,
      totals: totals.totals,
      paymentMethod,
      couponCode: totals.coupon?.code,
      notes,
      reservationId,
    });

    // 6. Clear the cart + enqueue side-effects (non-blocking).
    await cartService.clear(userId);
    await orderService.enqueuePostCheckout(order);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      totals: totals.totals,
    };
  },

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------
  /** Use client-supplied items when present, else fall back to the server cart. */
  async _resolveCartItems(userId, items) {
    if (Array.isArray(items) && items.length) return items;
    const cart = await cartService.getRawCart(userId);
    return cart?.items || [];
  },

  async _getAddress(userId, addressId) {
    const addresses = await addressService.list(userId);
    // `id` is a Mongo ObjectId here while `addressId` arrives as a JSON string,
    // so coerce both before comparing (otherwise valid addresses never match).
    const address = addresses.find((a) => String(a.id) === String(addressId));
    if (!address) throw new NotFoundError('Address not found');
    return address;
  },

  async _resolveStoreForAddress(address) {
    const [lng, lat] = address.coordinates || [];
    let store = null;
    if (lng != null && lat != null) {
      store = await storeService.resolveNearest({ lat, lng });
    }
    // Manually-added addresses may have no coordinates → fall back to the
    // default (first active) store so checkout still works.
    if (!store) store = await storeService.getDefaultStore();
    if (!store) throw new NotFoundError('No store services this location');
    return store;
  },

  async _fetchPrices(items) {
    const ids = items.map((i) => i.productId);
    const products = await productRepository.findManyByIds(ids);
    const prices = {};
    for (const p of products) {
      prices[p._id] = { price: p.pricing?.price ?? 0, mrp: p.pricing?.mrp ?? 0, name: p.name };
    }
    return prices;
  },

  async _computeTotals(items, prices, couponCode, userId) {
    let totalMrp = 0;
    let totalAmount = 0;

    const detailedItems = items.map((item) => {
      const pricing = prices[item.productId] || {};
      const unitPrice = pricing.price ?? 0;
      const unitMrp = pricing.mrp ?? unitPrice;
      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;
      totalMrp += unitMrp * item.quantity;
      return {
        productId: item.productId,
        name: pricing.name,
        quantity: item.quantity,
        unitPrice,
        unitMrp,
        lineTotal,
      };
    });

    // Coupon discount.
    let coupon = null;
    let discountPaise = 0;
    if (couponCode) {
      coupon = await couponService.apply(couponCode, userId, totalAmount);
      if (coupon) discountPaise = coupon.discountPaise;
    }

    // Delivery & platform fees.
    const deliveryFee = 0; // free delivery for this demo threshold
    const platformFee = totalAmount > 0 ? 500 : 0; // ₹5
    const grandTotal = Math.max(0, totalAmount - discountPaise + deliveryFee + platformFee);

    return {
      items: detailedItems,
      coupon,
      totals: {
        totalMrp,
        totalAmount,
        discountPaise,
        deliveryFee,
        platformFee,
        grandTotal,
      },
    };
  },

  async _rollbackReservations(items, storeId, reservationId, stopAfterProductId) {
    for (const item of items) {
      if (item.productId === stopAfterProductId) break;
      try {
        await inventoryService.releaseReservation({
          storeId,
          productId: item.productId,
          quantity: item.quantity,
          referenceId: reservationId,
        });
      } catch {
        /* best-effort rollback */
      }
    }
  },
};
