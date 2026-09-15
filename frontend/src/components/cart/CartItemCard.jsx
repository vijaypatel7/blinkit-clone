import React from 'react';
import { LazyImage } from '../common/LazyImage.jsx';
import { QuantityStepper } from '../common/QuantityStepper.jsx';
import { formatPaise } from '../../utils/index.js';

/**
 * CartItemCard — a single line item in the cart.
 */
export function CartItemCard({ item, onIncrement, onDecrement, onRemove }) {
  const lineTotal = (item.unitPrice || 0) * (item.quantity || 0);
  return (
    <div style={styles.row}>
      <LazyImage src={item.image} alt={item.name} ratio="1 / 1" style={{ width: 80, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={styles.name}>{item.name}</p>
        {item.unit && <p className="muted" style={{ margin: '2px 0', fontSize: 12 }}>{item.unit}</p>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={styles.price}>{formatPaise(item.unitPrice)}</span>
          {item.unitMrp > item.unitPrice && (
            <span style={styles.mrp}>{formatPaise(item.unitMrp)}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <QuantityStepper quantity={item.quantity} min={1} onIncrement={onIncrement} onDecrement={onDecrement} />
        <span style={styles.lineTotal}>{formatPaise(lineTotal)}</span>
        <button onClick={onRemove} style={styles.remove}>Remove</button>
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    gap: 14,
    padding: '16px 0',
    borderBottom: '1px solid var(--border)',
    alignItems: 'flex-start',
  },
  name: { margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.35 },
  price: { fontSize: 14, fontWeight: 700 },
  mrp: { fontSize: 12, color: 'var(--text-faint)', textDecoration: 'line-through' },
  lineTotal: { fontSize: 13, fontWeight: 700 },
  remove: { border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 600 },
};
