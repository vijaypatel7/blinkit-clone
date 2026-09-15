import React from 'react';
import { Link } from 'react-router-dom';
import { CartItemCard } from '../../components/cart/CartItemCard.jsx';
import { CartSummary } from '../../components/cart/CartSummary.jsx';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useCart } from '../../hooks/useCart.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * CartPage — full cart view + bill summary (client-side cart, no login needed).
 */
export function CartPage() {
  const { items, count, totals, increment, decrement, remove, clear } = useCart();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!items.length) {
    return (
      <div className="container">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          subtitle="Add some groceries to get started."
          action={<Link to="/"><Button>Start shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 20 }}>
      <div style={styles.header}>
        <h1 style={{ fontSize: 20 }}>My Cart ({count} items)</h1>
        <button style={styles.clearBtn} onClick={clear}>Clear cart</button>
      </div>

      <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 340px' }}>
        <div style={styles.items}>
          {items.map((item) => (
            <CartItemCard
              key={item.productId}
              item={item}
              onIncrement={() => increment(item.productId)}
              onDecrement={() => decrement(item.productId)}
              onRemove={() => remove(item.productId)}
            />
          ))}
        </div>

        <div style={{ ...styles.sidebar, position: isMobile ? 'static' : 'sticky' }}>
          <CartSummary totals={totals} />
          <Link to="/checkout" style={{ textDecoration: 'none' }}>
            <Button fullWidth size="lg" variant="green" style={{ marginTop: 12 }}>
              Proceed to Checkout
            </Button>
          </Link>
          <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 10 }}>
            Delivery in 12 minutes · Free above ₹199
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  clearBtn: { border: 'none', background: 'none', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20, alignItems: 'start' },
  items: { background: '#fff', borderRadius: 12, padding: '0 18px', border: '1px solid var(--border)' },
  sidebar: { position: 'sticky', top: 140 },
};
