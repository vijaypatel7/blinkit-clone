import React from 'react';

/**
 * QuantityStepper — Blinkit-style green stepper (− qty +).
 */
export function QuantityStepper({ quantity = 0, onIncrement, onDecrement, min = 0, compact = false }) {
  return (
    <div style={{ ...styles.wrap, ...(compact ? styles.compact : {}) }}>
      <button style={styles.btn} onClick={onDecrement} disabled={quantity <= min} aria-label="Decrease">
        −
      </button>
      <span style={styles.count}>{quantity}</span>
      <button style={styles.btn} onClick={onIncrement} aria-label="Increase">
        +
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'var(--green)',
    borderRadius: 8,
    overflow: 'hidden',
    color: '#fff',
    fontWeight: 700,
  },
  compact: { borderRadius: 6 },
  btn: {
    width: 34,
    height: 34,
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: 20,
    lineHeight: 1,
    cursor: 'pointer',
    fontWeight: 700,
  },
  count: { minWidth: 26, textAlign: 'center', fontSize: 14 },
};
