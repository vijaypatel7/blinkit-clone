import React from 'react';

/**
 * Pagination — cursor-friendly page controls.
 *
 * Works with the backend's cursor pagination: the page state is managed by the
 * parent (a stack of cursors), this component just renders prev/next + numbers.
 */
export function Pagination({ page = 1, hasNext = false, hasPrev = false, onPrev, onNext, onPage }) {
  // Render a small window of page numbers around the current page.
  const pages = [];
  const start = Math.max(1, page - 2);
  for (let p = start; p <= page + 2; p += 1) pages.push(p);

  return (
    <div style={styles.wrap}>
      <button style={styles.btn} onClick={onPrev} disabled={!hasPrev} aria-label="Previous page">
        ‹ Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage?.(p)}
          disabled={p === page}
          style={{ ...styles.btn, ...styles.num, ...(p === page ? styles.active : {}) }}
        >
          {p}
        </button>
      ))}

      <button style={styles.btn} onClick={onNext} disabled={!hasNext} aria-label="Next page">
        Next ›
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '20px 0',
  },
  btn: {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid var(--border-strong)',
    background: '#fff',
    color: '#1c1c1c',
    fontSize: 14,
    fontWeight: 600,
  },
  num: { minWidth: 40, justifyContent: 'center' },
  active: {
    background: 'var(--green)',
    color: '#fff',
    borderColor: 'var(--green)',
  },
};
