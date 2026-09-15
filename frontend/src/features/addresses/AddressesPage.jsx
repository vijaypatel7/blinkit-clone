import React, { useState } from 'react';
import { useGetAddressesQuery, useCreateAddressMutation, useDeleteAddressMutation } from '../../store/api.js';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';
import { useToast } from '../../app/providers/ToastProvider.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

const EMPTY_FORM = { name: '', phone: '', street: '', city: '', state: '', pincode: '' };

/**
 * AddressesPage — list + add/delete saved addresses.
 */
export function AddressesPage() {
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [createAddress] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.phone || !form.street || !form.city || !form.pincode) {
      toast('Please fill all required fields', { type: 'error' });
      return;
    }
    try {
      await createAddress({
        ...form,
        coordinates: [72.58, 23.02], // demo default; production uses geolocation/geocoding
      }).unwrap();
      setShowForm(false);
      setForm(EMPTY_FORM);
      toast('Address added', { type: 'success' });
    } catch (e) {
      toast(e.data?.error?.message || 'Failed to add address', { type: 'error' });
    }
  };

  const remove = async (id) => {
    await deleteAddress(id).unwrap();
    toast('Address removed', { type: 'success' });
  };

  if (isLoading) return <FullScreenLoader />;

  return (
    <div className="container" style={{ paddingTop: 20, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20 }}>Saved Addresses</h1>
        <Button size="sm" variant={showForm ? 'outline' : 'green'} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add Address'}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 12px' }}>
            <Input label="Full name" value={form.name} onChange={set('name')} />
            <Input label="Phone" value={form.phone} onChange={set('phone')} inputMode="tel" />
            <Input label="Street" value={form.street} onChange={set('street')} />
            <Input label="City" value={form.city} onChange={set('city')} />
            <Input label="State" value={form.state} onChange={set('state')} />
            <Input label="Pincode" value={form.pincode} onChange={set('pincode')} maxLength={6} />
          </div>
          <Button variant="green" onClick={submit}>Save address</Button>
        </Card>
      )}

      {!addresses?.length && !showForm ? (
        <EmptyState icon="📍" title="No addresses yet" subtitle="Add a delivery address to start ordering." />
      ) : (
        addresses?.map((addr) => (
          <Card key={addr.id} style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>
                🏠 {addr.name}{' '}
                {addr.isDefault && <span style={styles.badge}>Default</span>}
              </strong>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
              </p>
            </div>
            <button onClick={() => remove(addr.id)} style={{ border: 'none', background: 'none', color: 'var(--danger)', fontWeight: 600 }}>
              Delete
            </button>
          </Card>
        ))
      )}
    </div>
  );
}

const styles = {
  badge: { background: 'var(--lime)', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 5 },
};
