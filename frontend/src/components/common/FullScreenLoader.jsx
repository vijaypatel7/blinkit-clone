import React from 'react';
import { Spinner } from './Spinner.jsx';

/**
 * FullScreenLoader — centered loading state for lazy routes / initial data.
 */
export function FullScreenLoader({ label = 'Loading…' }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <Spinner size={32} />
      <span className="muted" style={{ fontSize: 14 }}>
        {label}
      </span>
    </div>
  );
}
