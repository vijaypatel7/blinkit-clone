import React from 'react';

/**
 * SectionHeader — a section title with an optional "See all" link.
 */
export function SectionHeader({ title, subtitle, to, onSeeAll }) {
  return (
    <div style={styles.row}>
      <div>
        <h2 style={{ fontSize: 20, letterSpacing: -0.3 }}>{title}</h2>
        {subtitle && <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>{subtitle}</p>}
      </div>
      {(to || onSeeAll) && (
        <a href={to} onClick={onSeeAll} style={styles.link}>
          See all <span aria-hidden>›</span>
        </a>
      )}
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  link: { color: 'var(--green)', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' },
};
