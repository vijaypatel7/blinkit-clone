import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist.js';
import { LazyImage } from '../../components/common/LazyImage.jsx';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { formatPaise } from '../../utils/index.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * WishlistPage — products saved from the heart button on product cards.
 * Reads the same Redux store as the cards, so it stays in sync automatically.
 */
export function WishlistPage() {
  const { items, remove } = useWishlist();
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (!items.length) {
    return (
      <div className="container">
        <EmptyState
          icon="❤️"
          title="Your wishlist is empty"
          subtitle="Tap the heart on any product to save it here."
          action={<Link to="/"><Button variant="green">Browse products</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 20, maxWidth: 900 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>My Wishlist ({items.length})</h1>

      <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(150px, 1fr))' : 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {items.map((item) => (
          <div key={item.id} style={styles.card}>
            <Link to={`/products/${item.id}`} style={{ display: 'block' }}>
              <LazyImage src={item.image} alt={item.name} ratio="1 / 1" style={{ borderRadius: 10 }} />
            </Link>
            <div style={styles.body}>
              <Link to={`/products/${item.id}`}>
                <p style={styles.name}>{item.name}</p>
              </Link>
              <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>{item.brand}</p>
              <div style={styles.footer}>
                <span style={styles.price}>{formatPaise(item.price)}</span>
                <button style={styles.remove} onClick={() => remove(item.id)}>
                  🤍 Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  body: { padding: '8px 2px 2px', display: 'flex', flexDirection: 'column', flex: 1 },
  name: {
    margin: 0,
    fontSize: 13.5,
    fontWeight: 600,
    lineHeight: 1.35,
    minHeight: 36,
    color: '#1c1c1c',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  price: { fontSize: 15, fontWeight: 700 },
  remove: {
    border: 'none',
    background: 'none',
    color: 'var(--text-muted)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
};
