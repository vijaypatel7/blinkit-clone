import React from 'react';
import { ORDER_FLOW, ORDER_STATUS_LABELS } from '../../constants/index.js';

/**
 * OrderStatusTimeline — visual progress through the order lifecycle.
 */
export function OrderStatusTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div style={{ ...styles.banner, background: 'var(--danger-soft)', color: 'var(--danger)' }}>
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <div style={styles.wrap}>
      {ORDER_FLOW.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step} style={styles.step}>
            <div style={styles.dotRow}>
              <span
                style={{
                  ...styles.dot,
                  ...(done || active ? { background: 'var(--green)', borderColor: 'var(--green)' } : {}),
                  ...(active ? { boxShadow: '0 0 0 4px rgba(12,131,31,0.15)' } : {}),
                }}
              >
                {done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
              </span>
              {i < ORDER_FLOW.length - 1 && (
                <span style={{ ...styles.line, ...(done ? { background: 'var(--green)' } : {}) }} />
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                color: done || active ? '#1c1c1c' : 'var(--text-faint)',
                fontWeight: done || active ? 700 : 500,
                textAlign: 'center',
              }}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    gap: 2,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid var(--border)',
    padding: 16,
    overflowX: 'auto',
  },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, gap: 6 },
  dotRow: { display: 'flex', alignItems: 'center', width: '100%' },
  dot: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid var(--border-strong)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, height: 2, background: 'var(--border-strong)', minWidth: 40 },
  banner: {
    padding: '14px 16px',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
  },
};
