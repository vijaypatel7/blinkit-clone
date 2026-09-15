import { createSlice } from '@reduxjs/toolkit';
import { storage, storageKeys } from '../services/storage.js';

/**
 * Wishlist slice — client-side wishlist with localStorage persistence.
 *
 * Every product card / detail page toggles the same store, so adding or
 * removing a product from any page is immediately reflected on the /wishlist
 * page (both read the same Redux state).
 */
const persisted = storage.get(storageKeys.WISHLIST, { items: [] });

function persist(state) {
  storage.set(storageKeys.WISHLIST, { items: state.items });
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: persisted.items || [],
  },
  reducers: {
    toggle(state, action) {
      const product = action.payload;
      const id = String(product.id);
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        state.items.unshift({
          id,
          name: product.name,
          brand: product.brand || null,
          unit: product.unit || null,
          image: product.image || product.images?.[0] || null,
          price: product.price ?? 0,
          mrp: product.mrp ?? product.price ?? 0,
        });
      }
      persist(state);
    },
    remove(state, action) {
      state.items = state.items.filter((i) => i.id !== String(action.payload));
      persist(state);
    },
    clear(state) {
      state.items = [];
      persist(state);
    },
  },
});

export const { toggle, remove, clear } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsWishlisted = (id) => (state) =>
  state.wishlist.items.some((i) => i.id === String(id));

export default wishlistSlice.reducer;
