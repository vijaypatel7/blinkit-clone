import React from 'react';
import { Link } from 'react-router-dom';
import { LazyImage } from '../common/LazyImage.jsx';
import { QuantityStepper } from '../common/QuantityStepper.jsx';
import { formatPaise } from '../../utils/index.js';
import { useWishlist } from '../../hooks/useWishlist.js';

/**
 * ProductCard — Blinkit-style: image, unit, price, green ADD / stepper, and a
 * wishlist heart on top of the image.
 */
export function ProductCard({ product, quantity = 0, onAdd, onIncrement, onDecrement }) {
  const { isWishlisted, toggle } = useWishlist();
  const wished = isWishlisted(product.id);
  const discountPct =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  // Search results omit `available`; default to in-stock unless explicitly false.
  const available = product.available !== false;

  return (
    <div style={styles.card}>
      <div style={styles.media}>
        <Link to={`/products/${product.id}`}>
          <LazyImage src={product.image} alt={product.name} ratio="1 / 1" />
        </Link>
        {discountPct > 0 && <span style={styles.discount}>{discountPct}% OFF</span>}
        <span style={styles.timer}>⏱ 11 MINS</span>
        {/* Wishlist heart */}
        <button
          style={styles.heart}
          onClick={(e) => {
            e.preventDefault();
            toggle(product);
          }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span style={{ color: wished ? '#e51d1d' : '#999' }}>{wished ? '❤️' : '🤍'}</span>
        </button>
      </div>

      <div style={styles.body}>
        <Link to={`/products/${product.id}`}>
          <p style={styles.name}>{product.name}</p>
        </Link>
        <p style={styles.unit}>{product.unit || product.brand}</p>

        <div style={styles.footer}>
          <div style={styles.pricing}>
            <span style={styles.price}>{formatPaise(product.price)}</span>
            {product.mrp > product.price && (
              <span style={styles.mrp}>{formatPaise(product.mrp)}</span>
            )}
          </div>

          {quantity > 0 ? (
            <QuantityStepper
              quantity={quantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              compact
            />
          ) : (
            <button
              style={styles.addBtn}
              onClick={onAdd}
              disabled={!available}
            >
              {available ? 'ADD' : 'SOLD OUT'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.15s, transform 0.15s',
  },
  media: { position: 'relative' },
  discount: {
    position: 'absolute',
    top: 8,
    left: 8,
    background: '#e2f0ff',
    color: '#1a73e8',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 6,
  },
  timer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    background: 'rgba(255,255,255,0.92)',
    color: '#1c1c1c',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 6,
  },
  heart: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: '#fff',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
  },
  body: { padding: 12, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
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
  unit: { margin: 0, fontSize: 12, color: 'var(--text-faint)' },
  footer: {
    marginTop: 'auto',
    paddingTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pricing: { display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' },
  price: { fontSize: 14.5, fontWeight: 700 },
  mrp: { fontSize: 12, color: 'var(--text-faint)', textDecoration: 'line-through' },
  addBtn: {
    padding: '8px 18px',
    borderRadius: 8,
    border: '1px solid var(--green)',
    background: '#fff',
    color: 'var(--green)',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 0.5,
  },
};
