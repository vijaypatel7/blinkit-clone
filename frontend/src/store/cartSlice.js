import { createSlice } from '@reduxjs/toolkit';
import { storage, storageKeys } from '../services/storage.js';
import { clearSession } from './authSlice.js';

/**
 * Cart slice — client-side cart (guest-first).
 *
 * The cart lives in localStorage so guests can browse + add items without an
 * account. Each item snapshots name/image/prices so the cart and checkout can
 * render fully offline; checkout re-validates prices on the server.
 */
const persisted = storage.get(storageKeys.CART, { items: [] });

function persist(state) {
  storage.set(storageKeys.CART, { items: state.items });
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: persisted.items || [],
  },
  reducers: {
    addItem(state, action) {
      const { product, quantity = 1 } = action.payload;
      const id = String(product.id);
      const existing = state.items.find((i) => i.productId === id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          productId: id,
          quantity,
          name: product.name,
          image: product.image || product.images?.[0] || null,
          unit: product.unit || null,
          unitPrice: product.price ?? 0,
          unitMrp: product.mrp ?? product.price ?? 0,
        });
      }
      persist(state);
    },
    incrementItem(state, action) {
      const item = state.items.find((i) => i.productId === String(action.payload));
      if (item) item.quantity += 1;
      persist(state);
    },
    decrementItem(state, action) {
      const id = String(action.payload);
      const item = state.items.find((i) => i.productId === id);
      if (!item) return;
      item.quantity -= 1;
      if (item.quantity <= 0) {
        state.items = state.items.filter((i) => i.productId !== id);
      }
      persist(state);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.productId !== String(action.payload));
      persist(state);
    },
    setItems(state, action) {
      state.items = action.payload || [];
      persist(state);
    },
    clear(state) {
      state.items = [];
      persist(state);
    },
  },
  // The cart is a per-user concern: whenever the session ends (manual logout,
  // token expiry, or auto-logout on a 401), empty the cart so the next user
  // (or the same user on their next login) starts fresh.
  extraReducers: (builder) => {
    builder.addCase(clearSession, (state) => {
      state.items = [];
      persist(state);
    });
  },
});

export const { addItem, incrementItem, decrementItem, removeItem, setItems, clear } =
  cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

/** Client-side totals (mirrors the backend `computeCartSummary`). */
export const selectCartTotals = (state) => {
  const items = state.cart.items;
  const totalMrp = items.reduce((s, i) => s + i.unitMrp * i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountPaise = Math.max(0, totalMrp - totalAmount);
  const platformFee = totalAmount > 0 ? 500 : 0;
  const grandTotal = totalAmount + platformFee;
  return {
    totalMrp,
    totalAmount,
    discountPaise,
    deliveryFee: 0,
    platformFee,
    grandTotal,
    savings: discountPaise,
  };
};

export default cartSlice.reducer;
