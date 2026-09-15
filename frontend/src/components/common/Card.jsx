import React from 'react';

/**
 * Card — surface container.
 */
export function Card({ children, onClick, style, ...rest }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        padding: 16,
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
