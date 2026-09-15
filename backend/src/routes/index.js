import { Router } from 'express';
import { env } from '../config/environment.js';
import { rateLimit } from '../middlewares/rateLimit.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

/**
 * Route registry.
 *
 * Each module exports its own router (its `*.routes.js`), which we mount here
 * under a shared `/api/v1` prefix. This keeps a single, readable map of the
 * entire API surface.
 */
import { authRoutes } from '../modules/auth/auth.routes.js';
import { userRoutes } from '../modules/users/user.routes.js';
import { addressRoutes } from '../modules/addresses/address.routes.js';
import { storeRoutes } from '../modules/stores/store.routes.js';
import { categoryRoutes } from '../modules/categories/category.routes.js';
import { productRoutes } from '../modules/products/product.routes.js';
import { inventoryRoutes } from '../modules/inventory/inventory.routes.js';
import { searchRoutes } from '../modules/search/search.routes.js';
import { cartRoutes } from '../modules/cart/cart.routes.js';
import { checkoutRoutes } from '../modules/checkout/checkout.routes.js';
import { orderRoutes } from '../modules/orders/order.routes.js';
import { paymentRoutes } from '../modules/payments/payment.routes.js';
import { promotionRoutes } from '../modules/promotions/promotion.routes.js';
import { couponRoutes } from '../modules/coupons/coupon.routes.js';
import { deliveryRoutes } from '../modules/delivery/delivery.routes.js';
import { notificationRoutes } from '../modules/notifications/notification.routes.js';
import { reviewRoutes } from '../modules/reviews/review.routes.js';
import { adminRoutes } from '../modules/admin/admin.routes.js';
import { homeRoutes } from '../modules/home/home.routes.js';

export function registerRoutes(app) {
  const api = Router();

  // ------------------------------------------------------------------
  // Public (unauthenticated) routes
  // ------------------------------------------------------------------
  api.use('/auth', rateLimit({ maxRequests: 30 }), authRoutes);
  api.use('/home', homeRoutes);
  api.use('/categories', categoryRoutes);
  api.use('/products', productRoutes);
  api.use('/stores', storeRoutes);
  api.use('/search', searchRoutes);
  api.use('/promotions', promotionRoutes);
  api.use('/coupons', couponRoutes);
  api.use('/payments/webhook', paymentRoutes); // gateway callbacks
  api.use('/reviews', reviewRoutes);

  // ------------------------------------------------------------------
  // Authenticated routes
  // ------------------------------------------------------------------
  const protectedRoutes = Router();
  protectedRoutes.use(authenticate);
  protectedRoutes.use('/users', userRoutes);
  protectedRoutes.use('/addresses', addressRoutes);
  protectedRoutes.use('/cart', cartRoutes);
  protectedRoutes.use('/checkout', checkoutRoutes);
  protectedRoutes.use('/orders', orderRoutes);
  protectedRoutes.use('/payments', paymentRoutes);
  protectedRoutes.use('/delivery', deliveryRoutes);
  protectedRoutes.use('/notifications', notificationRoutes);
  protectedRoutes.use('/admin', adminRoutes); // admin guards applied inside

  api.use(protectedRoutes);

  // Mount under the versioned prefix.
  app.use(env.apiPrefix, api);
}
