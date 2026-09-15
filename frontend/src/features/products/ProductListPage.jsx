import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../../store/api.js';
import { ProductGrid } from '../../components/product/ProductGrid.jsx';
import { useCart } from '../../hooks/useCart.js';

/**
 * ProductListPage — category/browse listing with sort (no pagination controls;
 * the list is fetched in a single bounded page and scrolls naturally).
 */
export function ProductListPage() {
  const { categoryId } = useParams();
  const [sort, setSort] = useState('popularity');
  const { add, increment, decrement, quantityOf } = useCart();

  const { data, isLoading, isFetching } = useGetProductsQuery({ categoryId, sort, limit: 60 });

  const cartQuantities = (data?.items || []).reduce((acc, p) => {
    const q = quantityOf(p.id);
    if (q > 0) acc[p.id] = q;
    return acc;
  }, {});

  return (
    <div className="container" style={{ paddingTop: 20 }}>
      <div style={styles.toolbar}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Products</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={styles.select}
          aria-label="Sort products"
        >
          <option value="popularity">Sort: Popularity</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <ProductGrid
        products={data?.items}
        loading={isLoading}
        cartQuantities={cartQuantities}
        onAdd={(p) => add(p)}
        onIncrement={(p) => increment(p.id)}
        onDecrement={(p) => decrement(p.id)}
      />
      {isFetching && !isLoading && (
        <p className="muted" style={{ textAlign: 'center' }}>Updating…</p>
      )}
    </div>
  );
}

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  select: {
    padding: '9px 14px',
    borderRadius: 10,
    border: '1px solid var(--border-strong)',
    background: '#fff',
    fontSize: 14,
    fontWeight: 600,
  },
};
