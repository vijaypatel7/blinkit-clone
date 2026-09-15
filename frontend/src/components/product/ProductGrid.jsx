import React from 'react';
import { ProductCard } from './ProductCard.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * ProductGrid — responsive grid of ProductCards with loading skeletons.
 * Columns adapt to the viewport (2 on phones, more as the screen widens).
 */
export function ProductGrid({ products, loading, cartQuantities = {}, onAdd, onIncrement, onDecrement }) {
  const isMobile = useMediaQuery('(max-width: 480px)');
  const minCol = isMobile ? 140 : 160;
  if (loading) {
    return (
      <div style={gridStyle(minCol)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton height={150} radius={10} />
            <Skeleton width="85%" />
            <Skeleton width="55%" />
            <Skeleton width={80} height={30} />
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return <EmptyState icon="🧺" title="No products found" subtitle="Try a different category or search." />;
  }

  return (
    <div style={gridStyle(minCol)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          quantity={cartQuantities[product.id] || 0}
          onAdd={() => onAdd(product)}
          onIncrement={() => onIncrement(product)}
          onDecrement={() => onDecrement(product)}
        />
      ))}
    </div>
  );
}

const gridStyle = (minCol) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${minCol}px, 1fr))`,
  gap: 16,
});
