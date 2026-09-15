import React from 'react';

/**
 * EmptyState — friendly placeholder for empty lists.
 */
export function EmptyState({ icon = '🛒', title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 48 }}>{icon}</div>
      <h3 style={{ margin: 0 }}>{title}</h3>
      {subtitle && <p className="muted" style={{ margin: 0 }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
