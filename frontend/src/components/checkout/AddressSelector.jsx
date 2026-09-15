import React from 'react';
import { Link } from 'react-router-dom';

const TYPE_ICON = { HOME: '🏠', WORK: '🏢', OTHER: '📍' };

/**
 * AddressSelector — radio list of saved addresses.
 */
export function AddressSelector({ addresses = [], selectedId, onSelect }) {
  if (!addresses.length) {
    return (
      <div style={styles.empty}>
        <p className="muted">No saved addresses.</p>
        <Link to="/addresses" style={{ color: 'var(--green)', fontWeight: 700 }}>
          Add an address →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {addresses.map((addr) => {
        const active = selectedId === addr.id;
        return (
          <label key={addr.id} style={{ ...styles.card, ...(active ? styles.active : {}) }}>
            <input
              type="radio"
              name="address"
              checked={active}
              onChange={() => onSelect(addr.id)}
              style={{ marginRight: 12, accentColor: 'var(--green)', width: 18, height: 18 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{TYPE_ICON[addr.type]} {addr.label || addr.type}</strong>
                {addr.isDefault && <span style={styles.badge}>Default</span>}
              </div>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                {addr.street}, {addr.city} — {addr.pincode}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
}

const styles = {
  empty: { padding: 20, textAlign: 'center', background: '#fff', borderRadius: 10, border: '1px dashed var(--border-strong)' },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    background: '#fff',
    border: '1.5px solid var(--border)',
    borderRadius: 12,
    padding: 14,
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  active: { borderColor: 'var(--green)', background: '#f4fbf5' },
  badge: { background: 'var(--lime)', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 5 },
};
