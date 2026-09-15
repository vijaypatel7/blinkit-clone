import React, { useRef } from 'react';
import { ProductCard } from './ProductCard.jsx';
import { SectionHeader } from '../common/SectionHeader.jsx';

/**
 * ProductCarousel — a horizontal row of product cards with LEFT / RIGHT arrows
 * floating at the vertical centre of the track (not beside the heading).
 * Used for "Popular", "Similar products", etc.
 */
export function ProductCarousel({ title, subtitle, products = [], cartQuantities = {}, onAdd, onIncrement, onDecrement, itemWidth = 180 }) {
  const trackRef = useRef(null);

  if (!products?.length) return null;

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section style={{ marginBottom: 28 }}>
      {title && <SectionHeader title={title} subtitle={subtitle} />}

      <div style={{ position: 'relative' }}>
        <button
          style={{ ...styles.arrow, ...styles.arrowLeft }}
          onClick={() => scrollBy(-1)}
          aria-label={`${title || 'items'} previous`}
        >
          ‹
        </button>

        <div ref={trackRef} className="hide-scrollbar" style={styles.track}>
          {products.map((p) => (
            <div key={p.id} style={{ width: itemWidth, flexShrink: 0 }}>
              <ProductCard
                product={p}
                quantity={cartQuantities[p.id] || 0}
                onAdd={() => onAdd(p)}
                onIncrement={() => onIncrement(p)}
                onDecrement={() => onDecrement(p)}
              />
            </div>
          ))}
        </div>

        <button
          style={{ ...styles.arrow, ...styles.arrowRight }}
          onClick={() => scrollBy(1)}
          aria-label={`${title || 'items'} next`}
        >
          ›
        </button>
      </div>
    </section>
  );
}

const styles = {
  track: {
    display: 'flex',
    gap: 14,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    padding: '8px 4px',
    scrollbarWidth: 'none',
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: '#fff',
    border: '1px solid var(--border-strong)',
    boxShadow: 'var(--shadow)',
    fontSize: 20,
    color: '#1c1c1c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  arrowLeft: { left: -10 },
  arrowRight: { right: -10 },
};
