import { configureStore } from '@reduxjs/toolkit';
import { api } from './api.js';
import authReducer from './authSlice.js';
import cartReducer from './cartSlice.js';
import locationReducer from './locationSlice.js';
import wishlistReducer from './wishlistSlice.js';

/**
 * Redux store.
 *
 * - `api.reducer` is the RTK Query slice (server state / caching).
 * - The other slices hold client state (auth, cart, location, wishlist).
 */
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    cart: cartReducer,
    location: locationReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});
