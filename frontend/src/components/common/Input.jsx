import React from 'react';

/**
 * Text input with label + error support.
 */
export function Input({ label, error, id, ...rest }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          ...base,
          ...(error ? { borderColor: '#d32f2f' } : {}),
        }}
        {...rest}
      />
      {error && <span style={{ color: '#d32f2f', fontSize: 12 }}>{error}</span>}
    </div>
  );
}

const base = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  borderRadius: 8,
  border: '1px solid #d1d5db',
  outline: 'none',
  background: '#fff',
  color: '#1a1a1a',
};
