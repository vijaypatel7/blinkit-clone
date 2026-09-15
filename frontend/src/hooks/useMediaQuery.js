import { useEffect, useState } from 'react';

/**
 * useMediaQuery — subscribe to a CSS media query from a component.
 *
 * The app styles components with inline styles (which can't use media queries),
 * so this hook lets a component render a different layout at different screen
 * sizes. It uses `window.matchMedia` with an event listener and cleans up on
 * unmount (no memory leaks, no manual window resize listeners).
 *
 * Usage:
 *   const isMobile = useMediaQuery('(max-width: 640px)');
 */
export function useMediaQuery(query) {
  // Lazy init so SSR / first paint don't read `window` prematurely.
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    // Prefer the modern `addEventListener`; fall back for older Safari.
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

// Common breakpoints used across the app (keep in sync with each other).
export const BREAKPOINTS = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
};
