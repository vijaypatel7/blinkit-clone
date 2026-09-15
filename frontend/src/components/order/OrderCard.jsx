import React from 'react';
import { Link } from 'react-router-dom';
import { ORDER_STATUS_LABELS } from '../../constants/index.js';
import { formatPaise, formatDate } from '../../utils/index.js';

const STATUS_COLOR = {
  DELIVERED: 'var(--green)',
  CANCELLED: 'var(--danger)',
};

/**
 * OrderCard — compact order summary in the orders list.
 */
export function OrderCard({ order }) {
  const color = STATUS_COLOR[order.status] || '#1a73e8';

  return (
    <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={styles.card}>
        <div style={styles.top}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{order.orderNumber}</span>
          <span style={{ ...styles.status, color, background: `${color}14` }}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12, margin: '6px 0' }}>
          {formatDate(order.createdAt)} · {order.items?.length} item(s)
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12 }} className="muted">
            {order.items?.slice(0, 2).map((i) => i.name).join(', ')}
            {order.items?.length > 2 ? ' +more' : ''}
          </span>
          <strong style={{ fontSize: 15 }}>{formatPaise(order.totals?.grandTotal)}</strong>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    transition: 'box-shadow 0.15s',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  status: {
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },
};
