import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetProfileQuery } from '../../store/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';

/**
 * ProfilePage — user profile + quick links.
 */
export function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: profile, isLoading } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ paddingTop: 48, textAlign: 'center' }}>
        <h2 style={{ fontSize: 22 }}>You're not logged in</h2>
        <p className="muted">Log in to see your profile and orders.</p>
        <Link to="/login"><Button size="lg">Login / Sign up</Button></Link>
      </div>
    );
  }

  if (isLoading) return <FullScreenLoader />;

  const name = profile?.name || user?.name || 'Customer';

  const links = [
    { to: '/orders', label: 'My Orders', icon: '📦', desc: 'Track and manage orders' },
    { to: '/addresses', label: 'My Addresses', icon: '📍', desc: 'Manage delivery addresses' },
    { to: '/wishlist', label: 'Wishlist', icon: '❤️', desc: 'Saved products' },
    { to: '/offers', label: 'Offers', icon: '🎁', desc: 'Deals & promotions' },
  ];

  return (
    <div className="container" style={{ paddingTop: 20, maxWidth: 560 }}>
      <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={styles.avatar}>{name[0]?.toUpperCase()}</div>
        <div>
          <h2 style={{ fontSize: 19 }}>{name}</h2>
          <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>{profile?.phone}</p>
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24 }}>{l.icon}</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{l.label}</strong>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>{l.desc}</p>
              </div>
              <span style={{ color: 'var(--text-faint)' }}>›</span>
            </Card>
          </Link>
        ))}
      </div>

      <Button fullWidth variant="outline" onClick={() => { logout(); navigate('/'); }}>
        Log out
      </Button>
    </div>
  );
}

const styles = {
  avatar: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'linear-gradient(140deg, var(--green), var(--green-700))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    fontWeight: 800,
  },
};
