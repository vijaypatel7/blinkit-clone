import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetHomeQuery } from '../../store/api.js';
import { Carousel } from '../../components/common/Carousel.jsx';
import { SectionHeader } from '../../components/common/SectionHeader.jsx';
import { ProductCarousel } from '../../components/product/ProductCarousel.jsx';
import { LazyImage } from '../../components/common/LazyImage.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';
import { useCart } from '../../hooks/useCart.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { categoryImage, HOME_BANNERS } from '../../constants/index.js';

/**
 * HomePage — Blinkit-style:
 *   hero banner carousel (real Blinkit masthead images) → full category grid →
 *   popular + similar product carousels.
 *
 * Product data comes from the cached `GET /home` endpoint; the hero banner +
 * category tiles mirror blinkit.com so the page looks identical.
 */
export function HomePage() {
  const { lat, lng, label } = useSelector((state) => state.location);
  const homeParams = lat != null && lng != null ? { lat, lng } : {};
  const { data, isLoading, isError } = useGetHomeQuery(homeParams);
  const { add, increment, decrement, quantityOf } = useCart();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  // 10 columns → 2 even rows on desktop; fewer columns on smaller screens so
  // tiles stay legible (never squished).
  const categoryColumns = isMobile ? 5 : isTablet ? 5 : 10;

  if (isLoading) return <FullScreenLoader label="Loading your store…" />;
  if (isError || !data) {
    return (
      <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
        <h2>Unable to load home</h2>
        <p className="muted">Set your delivery location and try again.</p>
      </div>
    );
  }

  const { store, categories, featured, popular } = data;

  const cartQuantities = (popular || []).reduce((acc, p) => {
    const q = quantityOf(p.id);
    if (q > 0) acc[p.id] = q;
    return acc;
  }, {});

  // Hero carousel — the live Blinkit masthead banners.
  const heroSlides = HOME_BANNERS.map((b) => <BannerSlide key={b.id} banner={b} />);

  // Category tiles — all of them, Blinkit-style.
  const categoryList = categories?.length ? categories : [];

  const similar = (featured && featured.length > 0 ? featured : (popular || []).slice().reverse()).slice(0, 14);

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      {/* Location / delivery banner */}
      <div style={styles.locationBanner}>
        <div>
          <p style={styles.bannerTitle}>
            Hey! Delivery in <strong>12 minutes</strong>
          </p>
          <p style={styles.bannerSub}>📍 {label} {store ? `· ${store.name}` : ''}</p>
        </div>
      </div>

      {/* Hero banner carousel (real Blinkit images) */}
      <div style={{ marginBottom: 28 }}>
        <Carousel slides={heroSlides} height={240} />
      </div>

      {/* Full category grid — looks identical to blinkit.com.
          The Blinkit tile images already contain the category name baked in,
          so we render the image only (no extra text label). */}
      <SectionHeader title="Shop by category" />
      <div style={{ ...styles.categoryGrid, gridTemplateColumns: `repeat(${categoryColumns}, minmax(0, 1fr))`, gap: isMobile ? 10 : 16 }}>
        {categoryList.map((cat) => (
          <Link key={cat.id} to={`/categories/${cat.id}`} style={styles.categoryTile} aria-label={cat.name}>
            {/* Blinkit category tiles are portrait (270×396) with the name baked
                in, so we render them at their native ratio — never square —
                otherwise `cover` would crop the label off the top. */}
            <LazyImage src={categoryImage(cat)} alt={cat.name} ratio="270 / 396" style={{ borderRadius: 12 }} />
          </Link>
        ))}
      </div>

      {/* Popular right now — carousel with left/right toggles */}
      <ProductCarousel
        title="Popular right now"
        subtitle="Trending in your area"
        products={popular || []}
        cartQuantities={cartQuantities}
        onAdd={(p) => add(p)}
        onIncrement={(p) => increment(p.id)}
        onDecrement={(p) => decrement(p.id)}
      />

      {/* You might also like — second carousel */}
      <ProductCarousel
        title="You might also like"
        subtitle="Handpicked for you"
        products={similar}
        cartQuantities={cartQuantities}
        onAdd={(p) => add(p)}
        onIncrement={(p) => increment(p.id)}
        onDecrement={(p) => decrement(p.id)}
      />
    </div>
  );
}

function BannerSlide({ banner }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        borderRadius: 16,
        backgroundImage: `url(${banner.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        padding: 16,
      }}
    >
      <span
        style={{
          background: 'rgba(0,0,0,0.45)',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {banner.title}
      </span>
    </div>
  );
}

const styles = {
  locationBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f4fbf5',
    border: '1px solid #d5efdc',
    borderRadius: 14,
    padding: '14px 20px',
    marginBottom: 24,
  },
  bannerTitle: { margin: 0, fontSize: 16, fontWeight: 600 },
  bannerSub: { margin: '3px 0 0', fontSize: 13, color: 'var(--text-muted)' },
  bannerRight: { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)' },

  categoryGrid: {
    // Column count is set inline (10 on desktop → 2 even rows; 5 on smaller
    // screens). Tiles stretch to the column width, so the layout stays aligned.
    display: 'grid',
    gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
    gap: 16,
    padding: '12px 0 16px',
    marginBottom: 24,
  },
  categoryTile: {
    display: 'block',
    textDecoration: 'none',
    color: '#1c1c1c',
  },
};
