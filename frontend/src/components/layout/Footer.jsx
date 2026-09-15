import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCategoryTreeQuery } from '../../store/api.js';
import { Icon } from '../common/Icon.jsx';
import { FOOTER_LINKS } from '../../constants/index.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * Footer — Blinkit-style with a full "categories" section, link columns,
 * newsletter, social icons and a legal bar (footer.design best practices:
 * clear hierarchy, grouped links, prominent categories, subtle motion).
 */
export function Footer() {
  const { data: categories } = useGetCategoryTreeQuery();
  const [showAll, setShowAll] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const flatCategories = (categories || []).flatMap((c) => [c, ...(c.children || [])]);
  const visible = showAll ? flatCategories : flatCategories.slice(0, 8);

  return (
    <footer style={styles.footer}>
      {/* Top band — brand + newsletter */}
      <div className="container" style={styles.topBand}>
        <div style={styles.brand}>
          <span style={styles.logo}>
            blinkit<span style={{ color: 'var(--lime)' }}>.</span>
          </span>
          <p style={styles.tagline}>Groceries delivered in minutes,<br />every single day.</p>
        </div>

        <div style={styles.newsletter}>
          <p style={styles.newsletterTitle}>Get the best offers first</p>
          <form style={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Enter your email" style={styles.newsletterInput} aria-label="Email" />
            <button style={styles.newsletterBtn}>Subscribe</button>
          </form>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '8px 0 0' }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Link columns + categories */}
      <div
        className="container"
        style={{ ...styles.columns, gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 20 : 32 }}
      >
        <div style={{ ...styles.categoriesCol, ...(isMobile ? { gridColumn: '1 / -1' } : {}) }}>
          <h4 style={styles.colTitle}>Categories</h4>
          <div style={styles.categoryLinks}>
            {visible.map((cat) => (
              <Link key={cat.id} to={`/categories/${cat.id}`} style={styles.categoryLink}>
                {cat.name}
              </Link>
            ))}
          </div>
          {flatCategories.length > 8 && (
            <button style={styles.showAll} onClick={() => setShowAll((s) => !s)}>
              {showAll ? 'Show less ‹' : `See all categories (${flatCategories.length}) ›`}
            </button>
          )}
        </div>

        {Object.entries(FOOTER_LINKS).map(([group, links]) => (
          <div key={group} style={styles.col}>
            <h4 style={styles.colTitle}>{group}</h4>
            {links.map((label) => (
              <a key={label} href="#" onClick={(e) => e.preventDefault()} style={styles.colLink}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Social row */}
      <div className="container" style={styles.socialRow}>
        <span className="muted" style={{ fontSize: 13 }}>Follow us</span>
        <div style={styles.socialIcons}>
          {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((name) => (
            <a key={name} href="#" onClick={(e) => e.preventDefault()} style={styles.social} aria-label={name}>
              <Icon name={name} size={18} />
            </a>
          ))}
        </div>
      </div>

      {/* Legal bar */}
      <div className="container" style={styles.legalBar}>
        <span>© {new Date().getFullYear()} blinkit.</span>
        <div style={{ display: 'flex', gap: 18 }}>
          <a href="#" onClick={(e) => e.preventDefault()} style={styles.legal}>Privacy</a>
          <a href="#" onClick={(e) => e.preventDefault()} style={styles.legal}>Terms</a>
          <a href="#" onClick={(e) => e.preventDefault()} style={styles.legal}>Sitemap</a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#f3f4f1',
    borderTop: '1px solid var(--border)',
    marginTop: 48,
  },
  topBand: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 24,
    padding: '32px 16px 24px',
    borderBottom: '1px solid var(--border)',
  },
  brand: { display: 'flex', flexDirection: 'column', gap: 6 },
  logo: { fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: 'var(--green)' },
  tagline: { margin: 0, color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.5 },
  newsletter: { maxWidth: 360, flex: 1, minWidth: 260 },
  newsletterTitle: { margin: 0, fontWeight: 700, fontSize: 15, marginBottom: 10 },
  newsletterForm: { display: 'flex', gap: 8 },
  newsletterInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid var(--border-strong)',
    background: '#fff',
    fontSize: 14,
    outline: 'none',
  },
  newsletterBtn: {
    padding: '12px 20px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--green)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: 32,
    padding: '32px 16px',
  },
  categoriesCol: {},
  col: {},
  colTitle: { fontSize: 15, fontWeight: 700, marginBottom: 14 },
  categoryLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '6px 12px',
  },
  categoryLink: { color: 'var(--text-muted)', fontSize: 14, padding: '4px 0', display: 'block' },
  colLink: { color: 'var(--text-muted)', fontSize: 14, padding: '4px 0', display: 'block' },
  showAll: {
    border: 'none',
    background: 'none',
    color: 'var(--green)',
    fontWeight: 700,
    fontSize: 14,
    padding: 0,
    marginTop: 8,
    cursor: 'pointer',
  },
  socialRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderTop: '1px solid var(--border)',
  },
  socialIcons: { display: 'flex', gap: 10 },
  social: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: '#fff',
    border: '1px solid var(--border-strong)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#444',
    transition: 'all 0.15s',
  },
  legalBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    padding: '16px',
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  legal: { color: 'var(--text-muted)', fontSize: 13 },
};
