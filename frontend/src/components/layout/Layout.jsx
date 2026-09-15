import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';

/**
 * Layout — persistent app chrome around routed pages (header + footer only).
 *
 * The cart is client-side (guest-first), so no server cart sync is needed here.
 */
export function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
