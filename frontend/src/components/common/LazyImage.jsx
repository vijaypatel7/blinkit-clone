import React, { useState } from 'react';

/**
 * LazyImage — lazy-loads via native `loading="lazy"` and shows a skeleton
 * placeholder until the image is ready. Falls back gracefully on error.
 */
export function LazyImage({ src, alt = '', ratio = '1 / 1', objectFit = 'cover', style, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div style={{ aspectRatio: ratio, background: '#f0f0f0', overflow: 'hidden', ...style }}>
      {!loaded && !error && <div style={{ width: '100%', height: '100%', background: '#e8e8e8' }} />}
      {error ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          {/* Neutral placeholder — never echo the alt text, otherwise the label
              would appear twice when a tile already shows its name below. */}
          <span role="img" aria-label="Image unavailable">🛍️</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
          {...rest}
        />
      )}
    </div>
  );
}
