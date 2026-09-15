import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from '../store/index.js';
import { clearSession, isSessionExpired } from '../store/authSlice.js';
import { router } from './routes.jsx';
import { ErrorBoundary } from './errorBoundary/ErrorBoundary.jsx';
import { AppProviders } from './providers/index.jsx';

/**
 * Bootstrap: if the user refreshed the page with an already-expired access
 * token, log them out immediately. This prevents a stale token from lingering
 * in the UI and later surfacing as a raw "Token expired" error on an action.
 * (Any remaining expiry is still caught by the baseQuery's 401 handler.)
 */
if (isSessionExpired()) {
  store.dispatch(clearSession());
}

/**
 * Root application component.
 *
 * Wraps the router in the Redux store + error boundary. The providers/ folder
 * holds reusable context providers (theme, toast) that stack here.
 */
export function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      </Provider>
    </ErrorBoundary>
  );
}
