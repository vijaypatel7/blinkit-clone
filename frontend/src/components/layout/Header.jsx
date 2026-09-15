import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SearchBar } from './SearchBar.jsx';
import { LocationPickerModal } from './LocationPickerModal.jsx';
import { selectCartCount } from '../../store/cartSlice.js';
import { selectWishlistCount } from '../../store/wishlistSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * Header — Blinkit-style green bar (logo + location + search + wishlist +
 * login + cart) with a login-free location picker. Category tiles live on the
 * home page (matching blinkit.com), not in a scrollable nav strip.
 *
 * On small screens the single crowded row is split: the search bar drops to a
 * full-width second row and the action labels collapse to compact icons.
 */
export function Header() {
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const locationLabel = useSelector((state) => state.location.label);
  const { isAuthenticated, user } = useAuth();
  const [locationOpen, setLocationOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={styles.bar}>
        <div
          className="container"
          style={{ ...styles.inner, flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? 12 : 20 }}
        >
          <Link to="/" style={{ ...styles.logo, fontSize: isMobile ? 20 : 24 }}>
            blinkit<span style={{ color: 'var(--lime)' }}>.</span>
          </Link>

          <button
            style={{ ...styles.locationBox, minWidth: isMobile ? 0 : 130, maxWidth: isMobile ? 110 : undefined }}
            onClick={() => setLocationOpen(true)}
          >
            {!isMobile && <span style={styles.locationTitle}>Deliver in 12 minutes</span>}
            <span style={{ ...styles.locationLabel, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              📍 {locationLabel} ▾
            </span>
          </button>

          <div style={{ ...styles.search, maxWidth: isMobile ? 'none' : 640, order: isMobile ? 10 : undefined, flexBasis: isMobile ? '100%' : undefined }}>
            <SearchBar />
          </div>

          <div style={{ ...styles.actions, gap: isMobile ? 14 : 20, marginLeft: isMobile ? 'auto' : undefined }}>
            <Link to={isAuthenticated ? '/profile' : '/login'} style={styles.loginBtn}>
              {isAuthenticated ? (user?.name || 'Account').split(' ')[0] : 'Login'}
            </Link>

            <Link to="/wishlist" style={styles.wishlistBtn} aria-label="Wishlist">
              <span style={{ fontSize: 18 }}>❤️</span>
              {!isMobile && <span style={styles.cartLabel}>Wishlist</span>}
              {wishlistCount > 0 && <span style={styles.badge}>{wishlistCount > 99 ? '99+' : wishlistCount}</span>}
            </Link>

            <Link to="/cart" style={{ ...styles.cartBtn, padding: isMobile ? '9px 12px' : '9px 16px' }} aria-label="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1.5" /><circle cx="19" cy="21" r="1.5" />
                <path d="M2 3h2l2.4 12.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L21 7H6" />
              </svg>
              {cartCount > 0 && <span style={styles.badge}>{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      <LocationPickerModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </header>
  );
}

const styles = {
  bar: { background: 'var(--green)', color: '#fff' },
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '12px 16px',
  },
  logo: { fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: '#fff', whiteSpace: 'nowrap' },
  locationBox: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.25,
    minWidth: 130,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    background: 'none',
    border: 'none',
    color: '#fff',
    textAlign: 'left',
    padding: 0,
  },
  locationTitle: { fontSize: 13, fontWeight: 700 },
  locationLabel: { fontSize: 12, opacity: 0.9 },
  search: { flex: 1, maxWidth: 640 },
  actions: { display: 'flex', alignItems: 'center', gap: 20 },
  loginBtn: { color: '#fff', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' },
  cartBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--lime)',
    color: '#1c1c1c',
    padding: '9px 16px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    position: 'relative',
  },
  cartLabel: { whiteSpace: 'nowrap' },
  wishlistBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -7,
    background: '#fff',
    color: 'var(--green)',
    fontSize: 11,
    fontWeight: 800,
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
    border: '2px solid var(--green)',
  },
};
