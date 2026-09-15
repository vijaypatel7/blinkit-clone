import React, { createContext, useContext, useMemo, useState } from 'react';

/**
 * Theme context — light/dark toggle.
 *
 * A thin context so components can read the active theme without prop-drilling.
 * (The demo primarily uses light mode; the hook is wired for extensibility.)
 */
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((t) => {
          const next = t === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme', next);
          return next;
        }),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
