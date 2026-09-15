import React from 'react';
import { ThemeProvider } from './ThemeProvider.jsx';
import { ToastProvider } from './ToastProvider.jsx';

/**
 * Composable provider stack.
 *
 * Order matters: theme → toast → (future) auth context. Each provider is a
 * small, single-responsibility context to keep re-renders scoped.
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
