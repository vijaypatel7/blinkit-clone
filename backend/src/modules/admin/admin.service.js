import { adminRepository } from './admin.repository.js';
import { orderRepository } from '../orders/order.repository.js';
import { orderService } from '../orders/order.service.js';
import { productRepository } from '../products/product.repository.js';
import { storeRepository } from '../stores/store.repository.js';
import { inventoryRepository } from '../inventory/inventory.repository.js';
import { toAuditLogResponse } from './admin.mapper.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { toOrderResponse } from '../orders/order.mapper.js';
import { toProductListItem } from '../products/product.mapper.js';
import { toStoreResponse } from '../stores/store.mapper.js';

/**
 * Admin service — KPI dashboard + privileged management operations.
 *
 * Every privileged action is recorded to the audit log.
 */
export const adminService = {
  async dashboard() {
    const [kpis, recentOrders] = await Promise.all([
      adminRepository.getKpis(),
      adminRepository.recentOrders({ limit: 10 }),
    ]);
    return {
      kpis,
      recentOrders: recentOrders.map(toOrderResponse),
    };
  },

  // Orders
  async updateOrderStatus(actor, orderId, { status, note }) {
    const order = await orderService.transition(orderId, status, { changedBy: 'admin', note });
    await this._audit(actor, 'STATUS_CHANGE', 'Order', orderId, null, { status });
    return order;
  },

  async listStoreOrders(storeId, { status, limit, cursor } = {}) {
    return orderService.listByStore(storeId, { status, limit, cursor });
  },

  // Products
  async updateProduct(actor, productId, data) {
    const before = await productRepository.findById(productId);
    if (!before) throw new NotFoundError('Product not found');
    const { productService } = await import('../products/product.service.js');
    const updated = await productService.update(productId, data);
    await this._audit(actor, 'UPDATE', 'Product', productId, { name: before.name }, data);
    return updated;
  },

  // Inventory adjustments
  async adjustInventory(actor, { storeId, productId, quantity, reason }) {
    const result = await inventoryRepository.recordAdjustment({ storeId, productId, quantity, referenceId: reason });
    await this._audit(actor, 'UPDATE', 'Inventory', result._id, null, { storeId, productId, quantity, reason });
    return result;
  },

  // Stores
  async updateStore(actor, storeId, data) {
    const { storeService } = await import('../stores/store.service.js');
    const updated = await storeService.update(storeId, data);
    await this._audit(actor, 'UPDATE', 'Store', storeId, null, data);
    return updated;
  },

  // Audit logs
  async listAuditLogs({ limit, cursor } = {}) {
    const { items, nextCursor, hasMore } = await adminRepository.listAuditLogs({ limit, cursor });
    return { items: items.map(toAuditLogResponse), nextCursor, hasMore };
  },

  async _audit(actor, action, entityType, entityId, before, after) {
    try {
      await adminRepository.recordAudit({
        actorId: actor.id,
        actorRole: actor.role,
        action,
        entityType,
        entityId,
        before: before ? flatten(before) : undefined,
        after: after ? flatten(after) : undefined,
      });
    } catch {
      /* audit failure should not block the operation */
    }
  },
};

/** Flatten a nested object to string values for the audit log. */
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = String(v);
  }
  return out;
}
