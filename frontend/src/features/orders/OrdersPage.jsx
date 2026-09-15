import React from 'react';
import { useGetOrdersQuery } from '../../store/api.js';
import { OrderCard } from '../../components/order/OrderCard.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';

/**
 * OrdersPage — list of the user's orders.
 */
export function OrdersPage() {
  const { data, isLoading } = useGetOrdersQuery({ limit: 20 });

  if (isLoading) return <FullScreenLoader />;

  if (!data?.items?.length) {
    return (
      <div className="container">
        <EmptyState icon="📦" title="No orders yet" subtitle="Your orders will appear here." />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 20, maxWidth: 720 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>My Orders</h1>
      {data.items.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
