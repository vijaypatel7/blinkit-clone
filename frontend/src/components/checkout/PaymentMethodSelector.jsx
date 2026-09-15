import React from 'react';
import { PAYMENT_METHODS } from '../../constants/index.js';

const ICONS = { UPI: '📱', CARD: '💳', NET_BANKING: '🏦', WALLET: '👛', COD: '💵' };

/**
 * PaymentMethodSelector — choose a payment method.
 */
export function PaymentMethodSelector({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
      {PAYMENT_METHODS.map((method) => {
        const active = selected === method;
        return (
          <button
            key={method}
            onClick={() => onSelect(method)}
            style={{ ...styles.card, ...(active ? styles.active : {}) }}
          >
            <span style={{ fontSize: 24 }}>{ICONS[method]}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{method.replace('_', ' ')}</span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '16px 8px',
    background: '#fff',
    border: '1.5px solid var(--border)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  active: { borderColor: 'var(--green)', background: '#f4fbf5' },
};
