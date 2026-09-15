import React from 'react';

/**
 * Spinner — small loading indicator.
 */
export function Spinner({ size = 20, color = '#f8cb46' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}
