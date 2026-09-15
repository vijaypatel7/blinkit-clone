import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from '../components/layout/Layout.jsx';
import { FullScreenLoader } from '../components/common/FullScreenLoader.jsx';

/**
 * Route table with CODE SPLITTING.
 *
 * Every non-core page is lazy-loaded so the initial bundle contains only the
 * Home page + core UI. Orders, Profile, Checkout, Wishlist, etc. are fetched
 * on demand — this keeps first paint fast.
 */
/**
 * `React.lazy` requires each dynamically imported module to expose a DEFAULT
 * export. Our feature pages use named exports, so we map the named export onto
 * a default in one place (keeps `import()` statements intact).
 */
const lazyPage = (namedExport, loader) =>
  lazy(() => loader().then((mod) => ({ default: mod[namedExport] })));

const HomePage = lazyPage('HomePage', () => import('../features/home/HomePage.jsx'));
const CategoriesPage = lazyPage('CategoriesPage', () => import('../features/categories/CategoriesPage.jsx'));
const ProductListPage = lazyPage('ProductListPage', () => import('../features/products/ProductListPage.jsx'));
const ProductDetailPage = lazyPage('ProductDetailPage', () => import('../features/products/ProductDetailPage.jsx'));
const SearchPage = lazyPage('SearchPage', () => import('../features/search/SearchPage.jsx'));
const CartPage = lazyPage('CartPage', () => import('../features/cart/CartPage.jsx'));
const CheckoutPage = lazyPage('CheckoutPage', () => import('../features/checkout/CheckoutPage.jsx'));
const OrdersPage = lazyPage('OrdersPage', () => import('../features/orders/OrdersPage.jsx'));
const OrderDetailPage = lazyPage('OrderDetailPage', () => import('../features/orders/OrderDetailPage.jsx'));
const AddressesPage = lazyPage('AddressesPage', () => import('../features/addresses/AddressesPage.jsx'));
const WishlistPage = lazyPage('WishlistPage', () => import('../features/wishlist/WishlistPage.jsx'));
const OffersPage = lazyPage('OffersPage', () => import('../features/offers/OffersPage.jsx'));
const ProfilePage = lazyPage('ProfilePage', () => import('../features/profile/ProfilePage.jsx'));
const LoginPage = lazyPage('LoginPage', () => import('../features/auth/LoginPage.jsx'));

/** Wrap a lazy component in a Suspense boundary with a centered loader. */
const withSuspense = (Component) => (
  <Suspense fallback={<FullScreenLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: withSuspense(HomePage) },
      { path: '/categories', element: withSuspense(CategoriesPage) },
      { path: '/categories/:categoryId', element: withSuspense(ProductListPage) },
      { path: '/products/:productId', element: withSuspense(ProductDetailPage) },
      { path: '/search', element: withSuspense(SearchPage) },
      { path: '/cart', element: withSuspense(CartPage) },
      { path: '/checkout', element: withSuspense(CheckoutPage) },
      { path: '/orders', element: withSuspense(OrdersPage) },
      { path: '/orders/:orderId', element: withSuspense(OrderDetailPage) },
      { path: '/addresses', element: withSuspense(AddressesPage) },
      { path: '/wishlist', element: withSuspense(WishlistPage) },
      { path: '/offers', element: withSuspense(OffersPage) },
      { path: '/profile', element: withSuspense(ProfilePage) },
      { path: '/login', element: withSuspense(LoginPage) },
    ],
  },
]);
