import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { storage, storageKeys } from '../services/storage.js';
import { clearSession } from './authSlice.js';

/**
 * RTK Query API definition.
 *
 * This is the single source of truth for ALL server data. It provides:
 *   - automatic request caching + deduplication,
 *   - tag-based invalidation (mutations auto-refresh related queries),
 *   - loading/error states via generated hooks.
 *
 * Endpoints are grouped by domain; features import the generated hooks.
 */
/**
 * Base query that unwraps the backend's `{ success, data, meta }` envelope.
 *
 * The backend returns every payload as `{ success: true, data: ... }`; RTK Query
 * would otherwise hand that whole envelope to the component as `data`. Here we
 * unwrap it so `useXxxQuery().data` is the actual payload. Errors are left
 * untouched (components read `e.data.error.message` from the error envelope).
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
  prepareHeaders: (headers) => {
    const token = storage.get(storageKeys.AUTH_TOKEN);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    // Auto-logout on an expired/invalid token. If we were authenticated (we
    // hold a token) and the server rejects it with 401, the session has gone
    // stale — clear it (this also empties the cart) instead of surfacing a raw
    // "Token expired" error. Login attempts (no token yet) are left alone so a
    // wrong OTP still shows its normal "Invalid OTP" message.
    if (result.error.status === 401 && storage.get(storageKeys.AUTH_TOKEN)) {
      api.dispatch(clearSession());
    }
    return result;
  }
  const body = result.data;
  if (body && typeof body === 'object' && 'data' in body && body.success !== false) {
    return { data: body.data };
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Product', 'Cart', 'Order', 'Address', 'Wishlist', 'Profile', 'Notification'],
  endpoints: (builder) => ({
    // ----- Home -----
    getHome: builder.query({
      query: ({ lat, lng, zone } = {}) => ({
        url: '/home',
        params: { lat, lng, zone },
      }),
    }),

    // ----- Categories -----
    getCategoryTree: builder.query({
      query: () => '/categories/tree',
      providesTags: ['Product'],
    }),

    // ----- Products -----
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),
    getPopularProducts: builder.query({
      query: (zone = 'default') => ({ url: '/products/popular', params: { zone } }),
    }),

    // ----- Search -----
    search: builder.query({
      query: ({ q, type }) => ({ url: '/search', params: { q, type } }),
    }),
    suggest: builder.query({
      query: (q) => ({ url: '/search/suggest', params: { q } }),
    }),

    // ----- Cart -----
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/cart/items/${productId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation({
      query: (productId) => ({ url: `/cart/items/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),

    // ----- Checkout / Orders -----
    checkoutQuote: builder.query({
      query: ({ addressId, couponCode }) => ({
        url: '/checkout/quote',
        method: 'POST',
        body: { addressId, couponCode },
      }),
    }),
    checkout: builder.mutation({
      query: (body) => ({ url: '/checkout', method: 'POST', body }),
      invalidatesTags: ['Cart', 'Order'],
    }),
    getOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation({
      query: ({ id, reason }) => ({ url: `/orders/${id}/cancel`, method: 'POST', body: { reason } }),
      invalidatesTags: ['Order'],
    }),

    // ----- Payments (Razorpay) -----
    initiatePayment: builder.mutation({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
    }),
    verifyPayment: builder.mutation({
      query: (body) => ({ url: '/payments/verify', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),

    // ----- Addresses -----
    getAddresses: builder.query({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),
    createAddress: builder.mutation({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      invalidatesTags: ['Address'],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/addresses/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Address'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({ url: `/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Address'],
    }),

    // ----- Auth / Profile -----
    sendOtp: builder.mutation({
      query: (body) => ({ url: '/auth/otp/send', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({ url: '/auth/otp/verify', method: 'POST', body }),
    }),
    getProfile: builder.query({
      query: () => '/users/me',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),

    // ----- Reviews -----
    getReviews: builder.query({
      query: (productId) => `/reviews/product/${productId}`,
    }),
    createReview: builder.mutation({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Product'],
    }),

    // ----- Wishlist (client-side demo; see wishlist feature) -----
    // ----- Offers -----
    getPromotions: builder.query({
      query: () => '/promotions',
    }),
    getBanners: builder.query({
      query: () => '/promotions/banners',
    }),

    // ----- Notifications -----
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetHomeQuery,
  useGetCategoryTreeQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useGetPopularProductsQuery,
  useSearchQuery,
  useSuggestQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useCheckoutQuoteQuery,
  useCheckoutMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
  useGetPromotionsQuery,
  useGetBannersQuery,
  useGetNotificationsQuery,
} = api;
