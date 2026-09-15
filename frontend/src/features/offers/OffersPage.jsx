import React from 'react';
import { useGetPromotionsQuery, useGetBannersQuery } from '../../store/api.js';
import { Carousel } from '../../components/common/Carousel.jsx';
import { Card } from '../../components/common/Card.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';

/**
 * OffersPage — banner carousel + active offers/promotions.
 */
export function OffersPage() {
  const { data: banners, isLoading: bannersLoading } = useGetBannersQuery();
  const { data: offers, isLoading: offersLoading } = useGetPromotionsQuery();

  if (bannersLoading || offersLoading) return <FullScreenLoader />;

  const slides =
    banners?.length > 0
      ? banners.map((b) => (
          <div key={b.id} style={{ height: '100%', width: '100%', background: 'linear-gradient(120deg, #0c831f, #0a6b1a)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>
            <h2 style={{ fontSize: 24 }}>{b.title}</h2>
            <p style={{ margin: '6px 0 0', opacity: 0.9 }}>{b.description}</p>
          </div>
        ))
      : [];

  return (
    <div className="container" style={{ paddingTop: 20, maxWidth: 860 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Offers & Promotions</h1>

      {slides.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Carousel slides={slides} height={190} />
        </div>
      )}

      {offers?.map((o) => (
        <Card key={o.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <strong style={{ fontSize: 15 }}>{o.title}</strong>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{o.description}</p>
            </div>
            {o.couponCode && <code style={styles.coupon}>{o.couponCode}</code>}
          </div>
        </Card>
      ))}

      {!offers?.length && <p className="muted">No active offers right now.</p>}
    </div>
  );
}

const styles = {
  coupon: { background: 'var(--lime)', padding: '5px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' },
};
