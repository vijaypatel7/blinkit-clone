import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductQuery, useGetReviewsQuery, useGetProductsQuery } from '../../store/api.js';
import { LazyImage } from '../../components/common/LazyImage.jsx';
import { Button } from '../../components/common/Button.jsx';
import { QuantityStepper } from '../../components/common/QuantityStepper.jsx';
import { ProductCarousel } from '../../components/product/ProductCarousel.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';
import { formatPaise } from '../../utils/index.js';
import { useCart } from '../../hooks/useCart.js';
import { useWishlist } from '../../hooks/useWishlist.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

/**
 * ProductDetailPage — full product view: image, price, description, reviews,
 * working add-to-cart (client cart), wishlist and a "similar products" carousel.
 */
export function ProductDetailPage() {
  const { productId } = useParams();
  const { data: product, isLoading } = useGetProductQuery(productId);
  const { data: reviews } = useGetReviewsQuery(productId, { skip: !productId });
  const { data: similar } = useGetProductsQuery(
    { categoryId: product?.categoryId, limit: 12 },
    { skip: !product?.categoryId }
  );
  const { add, increment, decrement, quantityOf } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isLoading) return <FullScreenLoader />;
  if (!product) return <p className="container" style={{ paddingTop: 24 }}>Product not found.</p>;

  const inCart = quantityOf(product.id);
  const discountPct =
    product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const similarItems = (similar?.items || []).filter((p) => p.id !== product.id);

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <nav style={styles.breadcrumb}>
        <Link to="/">Home</Link> <span>›</span> {product.brand || 'Products'} <span>›</span>{' '}
        <span style={{ color: 'var(--text)' }}>{product.name}</span>
      </nav>

      <div style={{ ...styles.layout, gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 400px) 1fr', gap: isMobile ? 20 : 40 }}>
        {/* Image */}
        <div style={{ ...styles.media, position: isMobile ? 'static' : 'sticky' }}>
          <LazyImage
            src={product.images?.[0]}
            alt={product.name}
            ratio="1 / 1"
            style={{ width: '100%', borderRadius: 16, border: '1px solid var(--border)' }}
          />
        </div>

        {/* Info */}
        <div style={styles.info}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <h1 style={{ fontSize: 22, letterSpacing: -0.3, lineHeight: 1.25 }}>{product.name}</h1>
            <button style={styles.heart} onClick={() => toggle(product)} aria-label="Toggle wishlist">
              {isWishlisted(product.id) ? '❤️' : '🤍'}
            </button>
          </div>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            {product.brand} {product.unit ? `· ${product.unit}` : ''}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
            <span style={styles.rating}>★ {product.rating || 4.5}</span>
            <span className="muted" style={{ fontSize: 13 }}>{product.reviewCount || 0} ratings</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '14px 0' }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>{formatPaise(product.price)}</span>
            {product.mrp > product.price && (
              <span style={{ color: 'var(--text-faint)', textDecoration: 'line-through', fontSize: 18 }}>
                {formatPaise(product.mrp)}
              </span>
            )}
            {discountPct > 0 && <span style={styles.discountBadge}>{discountPct}% OFF</span>}
          </div>

          {/* Add to cart (client cart — works without login) */}
          <div style={{ margin: '18px 0', width: 220 }}>
            {inCart > 0 ? (
              <QuantityStepper
                quantity={inCart}
                min={1}
                onIncrement={() => increment(product.id)}
                onDecrement={() => decrement(product.id)}
              />
            ) : (
              <Button fullWidth size="lg" variant="green" onClick={() => add(product)}>
                ADD TO CART
              </Button>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div style={styles.description}>
              <h3 style={{ fontSize: 15, marginBottom: 8 }}>About this product</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>
                {product.description || 'Fresh, high-quality product delivered to your doorstep in minutes.'}
              </p>
            </div>
          )}

          {/* Service facts */}
          <div style={styles.facts}>
            <div>🚚 <span>Delivery in 12 mins</span></div>
            <div>💯 <span>100% quality guaranteed</span></div>
            <div>↩️ <span>Easy returns</span></div>
          </div>
        </div>
      </div>

      {/* Similar products carousel */}
      {similarItems.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <ProductCarousel
            title="Similar products"
            subtitle="You may also like these"
            products={similarItems}
            cartQuantities={similarItems.reduce((acc, p) => ({ ...acc, [p.id]: quantityOf(p.id) }), {})}
            onAdd={(p) => add(p)}
            onIncrement={(p) => increment(p.id)}
            onDecrement={(p) => decrement(p.id)}
          />
        </div>
      )}

      {/* Reviews */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Ratings & Reviews ({product.reviewCount || 0})</h2>
        {reviews?.items?.length ? (
          reviews.items.map((r) => (
            <div key={r.id} style={styles.review}>
              <div style={{ color: 'var(--lime-dark)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              <strong style={{ fontSize: 14 }}>{r.title}</strong>
              <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>{r.comment}</p>
            </div>
          ))
        ) : (
          <p className="muted">No reviews yet. Be the first to review!</p>
        )}
      </section>
    </div>
  );
}

const styles = {
  breadcrumb: { fontSize: 13, color: 'var(--text-faint)', marginBottom: 16, display: 'flex', gap: 8 },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 400px) 1fr',
    gap: 40,
    alignItems: 'flex-start',
  },
  media: { position: 'sticky', top: 120 },
  info: { minWidth: 0 },
  rating: { background: 'var(--green)', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 13, fontWeight: 700 },
  heart: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: '#fff',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    fontSize: 18,
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: { background: '#e2f0ff', color: '#1a73e8', fontSize: 13, fontWeight: 700, padding: '2px 8px', borderRadius: 6 },
  description: {
    background: '#fafafa',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  facts: { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--text-muted)' },
  review: { borderBottom: '1px solid var(--border)', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 4 },
};
