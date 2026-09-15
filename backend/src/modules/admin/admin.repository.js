import { AuditLog } from './admin.model.js';
import { Order } from '../orders/order.model.js';
import { Product } from '../products/product.model.js';
import { Store } from '../stores/store.model.js';
import { User } from '../users/user.model.js';
import { Inventory } from '../inventory/inventory.model.js';

/**
 * Admin repository — aggregates KPIs and provides audit logging.
 */
export const adminRepository = {
  async recordAudit(entry) {
    return AuditLog.create(entry);
  },

  async listAuditLogs({ limit = 50, cursor } = {}) {
    const filter = {};
    if (cursor) {
      const d = new Date(cursor);
      if (!Number.isNaN(d.getTime())) filter.createdAt = { $lt: d };
    }
    const items = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    return {
      items: page,
      nextCursor: hasMore ? page[page.length - 1].createdAt.toISOString() : null,
      hasMore,
    };
  },

  async getKpis() {
    const [totalOrders, totalProducts, totalStores, totalUsers, revenue] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      Store.countDocuments(),
      User.countDocuments({ role: 'CUSTOMER' }),
      Order.aggregate([
        { $match: { paymentStatus: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } },
      ]),
    ]);

    // Count low-stock SKUs.
    const lowStock = await Inventory.countDocuments({ availableQuantity: { $lte: 5 } });

    return {
      totalOrders,
      totalProducts,
      totalStores,
      totalUsers,
      revenuePaise: revenue[0]?.total || 0,
      lowStockSkus: lowStock,
    };
  },

  async recentOrders({ limit = 10 } = {}) {
    return Order.find().sort({ createdAt: -1 }).limit(limit).lean();
  },
};
