import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetOrderQuery, useCancelOrderMutation } from '../../store/api.js';
import { CartSummary } from '../../components/cart/CartSummary.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';
import { formatDate, formatPaise } from '../../utils/index.js';
import { useToast } from '../../app/providers/ToastProvider.jsx';

/**
 * OrderDetailPage — doubles as the order confirmation page:
 * a "confirmed" hero, delivery ETA, a static map placeholder (store → home),
 * item list, bill details, and a cancel action for still-open orders.
 */

/** Build the ETA string ("~14 min" or a clock time) from the order. */
function etaText(order) {
  const expectedBy = order.delivery?.expectedBy ? new Date(order.delivery.expectedBy) : null;
  if (!expectedBy || Number.isNaN(expectedBy.getTime())) return 'in a few minutes';
  const mins = Math.max(1, Math.round((expectedBy - Date.now()) / 60000));
  if (mins >= 60) return `by ${expectedBy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return `in ~${mins} min`;
}

/** Static map placeholder (offline-safe). Shows the store→home line + pins. */
function DeliveryMap({ store, address }) {
  const pin = (x, y, emoji, label) => (
    <g>
      <circle cx={x} cy={y} r="16" fill="rgba(12,131,31,0.15)" />
      <circle cx={x} cy={y} r="10" fill="#0c831f" stroke="#fff" strokeWidth="2" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11">{emoji}</text>
      <text x={x} y={y - 22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1c1c1c">{label}</text>
    </g>
  );

  return (
    <div style={styles.mapWrap}>
      <svg viewBox="0 0 600 240" role="img" aria-label="Delivery route map" style={styles.mapSvg}>
        {/* stylized roads */}
        <rect width="600" height="240" fill="#eef3ea" />
        <path d="M0 60 H600" stroke="#fff" strokeWidth="14" />
        <path d="M0 160 H600" stroke="#fff" strokeWidth="14" />
        <path d="M120 0 V240" stroke="#fff" strokeWidth="12" />
        <path d="M430 0 V240" stroke="#fff" strokeWidth="12" />
        <path d="M0 120 H600" stroke="#cfe4cd" strokeWidth="5" strokeDasharray="8 8" />
        {/* route line store → home */}
        <path d="M150 150 C 250 150, 300 90, 430 90" stroke="#0c831f" strokeWidth="3" fill="none" strokeDasharray="6 6" />
        {pin(150, 150, '🏪', store?.name || 'Store')}
        {pin(430, 90, '🏠', address?.city || 'Home')}
      </svg>
      <div style={styles.mapFooter}>
        <span>🏪 {store?.name || 'Nearest store'}</span>
        <span style={{ color: 'var(--green)' }}>── {Math.max(1, etaMinsFromNow())} min away</span>
        <span>🏠 {[address?.street, address?.city].filter(Boolean).join(', ') || 'Your address'}</span>
      </div>
    </div>
  );
}

function etaMinsFromNow() {
  // Rough static estimate used by the map footer; the hero uses the real ETA.
  return 12;
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const { data: order, isLoading } = useGetOrderQuery(orderId);
  const [cancelOrder] = useCancelOrderMutation();
  const { toast } = useToast();

  if (isLoading) return <FullScreenLoader />;
  if (!order) return <p className="container">Order not found.</p>;

  const confirmed = order.status === 'CONFIRMED';
  const cancellable = ['CREATED', 'PAYMENT_PENDING', 'CONFIRMED'].includes(order.status);

  const handleCancel = async () => {
    try {
      await cancelOrder({ id: order.id, reason: 'USER_REQUESTED' }).unwrap();
      toast('Order cancelled', { type: 'success' });
    } catch (e) {
      toast(e?.data?.error?.message || 'Could not cancel', { type: 'error' });
    }
  };

  return (
    <div className="container" style={{ paddingTop: 20, maxWidth: 760 }}>
      {/* ---- Confirmation hero ---- */}
      <div style={styles.hero}>
        <div style={{ fontSize: 44 }}>{confirmed ? '✅' : '🛒'}</div>
        <h1 style={{ margin: '8px 0 4px', fontSize: 24 }}>
          {confirmed ? 'Order confirmed!' : `Order ${order.status.replace(/_/g, ' ').toLowerCase()}`}
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          {confirmed
            ? `A delivery agent will get your order to your doorstep ${etaText(order)}.`
            : `Order ${order.orderNumber} · placed ${formatDate(order.createdAt)}`}
        </p>
      </div>

      {/* ---- Delivery map ---- */}
      <div style={{ marginBottom: 20 }}>
        <DeliveryMap store={order.store} address={order.address} />
      </div>

      {/* ---- Order meta ---- */}
      <div style={styles.meta}>
        <div>
          <span className="muted" style={{ fontSize: 12 }}>Order number</span>
          <strong style={{ display: 'block' }}>{order.orderNumber}</strong>
        </div>
        <div>
          <span className="muted" style={{ fontSize: 12 }}>Payment</span>
          <strong style={{ display: 'block' }}>
            {order.paymentMethod === 'ONLINE' ? 'Paid online' : 'Cash on delivery'}
          </strong>
        </div>
        <div>
          <span className="muted" style={{ fontSize: 12 }}>Deliver to</span>
          <strong style={{ display: 'block' }}>{order.address?.name || 'Customer'}</strong>
          <span style={{ fontSize: 12 }} className="muted">
            {[order.address?.street, order.address?.city].filter(Boolean).join(', ')}
          </span>
        </div>
      </div>

      {/* ---- Items ---- */}
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Items ({order.items.length})</h3>
        {order.items.map((item) => (
          <div key={item.productId} style={styles.item}>
            <span style={{ flex: 1 }}>
              {item.name} <span className="muted">× {item.quantity}</span>
            </span>
            <span>{formatPaise(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <CartSummary totals={order.totals} />

      {cancellable && (
        <Button variant="danger" fullWidth style={{ marginTop: 16 }} onClick={handleCancel}>
          Cancel Order
        </Button>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/" className="muted" style={{ fontSize: 14 }}>← Continue shopping</Link>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    textAlign: 'center',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '28px 20px',
    marginBottom: 20,
    boxShadow: 'var(--shadow-sm)',
  },
  mapWrap: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  mapSvg: { display: 'block', width: '100%', height: 'auto' },
  mapFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    padding: '10px 16px',
    fontSize: 13,
    borderTop: '1px solid var(--border)',
  },
  meta: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  card: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: 14,
  },
};
