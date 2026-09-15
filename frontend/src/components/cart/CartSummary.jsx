import React from 'react';
import { formatPaise } from '../../utils/index.js';

/**
 * CartSummary — totals breakdown (bill details).
 */
export function CartSummary({ totals }) {
  const rows = [
    { label: 'MRP Total', value: totals?.totalMrp, strike: true },
    { label: 'Product Discount', value: totals?.discountPaise, negative: true },
    { label: 'Delivery Fee', value: totals?.deliveryFee ?? 0, free: true },
    { label: 'Platform Fee', value: totals?.platformFee ?? 0 },
  ];

  return (
    <div style={styles.card}>
      <h3 style={{ fontSize: 16, marginBottom: 14 }}>Bill details</h3>
      {rows.map((r) => (
        <div key={r.label} style={styles.row}>
          <span className={r.strike ? 'muted' : ''} style={r.strike ? { textDecoration: 'line-through' } : {}}>
            {r.label}
          </span>
          <span style={{ color: r.negative ? 'var(--green)' : '#1c1c1c' }}>
            {r.negative ? '−' : ''}
            {r.free && (r.value === 0 || r.value == null) ? 'FREE' : formatPaise(r.value)}
          </span>
        </div>
      ))}
      <div style={{ ...styles.row, borderTop: '1px dashed var(--border-strong)', paddingTop: 12, marginTop: 8 }}>
        <strong style={{ fontSize: 15 }}>To Pay</strong>
        <strong style={{ fontSize: 16 }}>{formatPaise(totals?.grandTotal)}</strong>
      </div>
      {totals?.savings > 0 && (
        <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--green)', fontWeight: 600 }}>
          🎉 You save {formatPaise(totals.savings)} on this order
        </p>
      )}
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: 12, padding: 18, border: '1px solid var(--border)' },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '5px 0' },
};
