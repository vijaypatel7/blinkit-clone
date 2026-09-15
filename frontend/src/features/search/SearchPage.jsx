import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchQuery } from '../../store/api.js';
import { ProductGrid } from '../../components/product/ProductGrid.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';
import { useCart } from '../../hooks/useCart.js';

/**
 * SearchPage — results for a search query (client cart, no login needed).
 */
export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { data, isLoading } = useSearchQuery({ q, type: 'all' }, { skip: !q });
  const { add, increment, decrement, quantityOf } = useCart();

  if (isLoading) return <FullScreenLoader />;

  const products = data?.products || [];
  const cartQuantities = products.reduce((acc, p) => {
    const n = quantityOf(p.id);
    if (n > 0) acc[p.id] = n;
    return acc;
  }, {});

  return (
    <div className="container" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Results for “{q}”</h1>
      <p className="muted" style={{ fontSize: 13, margin: '0 0 20px' }}>
        {products.length} product(s) found
      </p>
      <ProductGrid
        products={products}
        cartQuantities={cartQuantities}
        onAdd={(p) => add(p)}
        onIncrement={(p) => increment(p.id)}
        onDecrement={(p) => decrement(p.id)}
      />
    </div>
  );
}
