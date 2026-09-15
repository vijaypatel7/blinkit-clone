import React from 'react';

/**
 * Skeleton — shimmering placeholder block.
 */
export function Skeleton({ width = '100%', height = 16, radius = 6, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: '#e8e8e8',
        animation: 'pulse 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}
