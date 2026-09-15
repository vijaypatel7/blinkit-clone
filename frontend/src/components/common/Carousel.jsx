import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Carousel — auto-advancing banner carousel with arrows + dots.
 *
 * Slides are React nodes. The track is a scroll-snap container so users can
 * swipe/drag; the arrows/dots drive programmatic smooth scrolling.
 */
export function Carousel({ slides = [], interval = 4500, height = 210, autoPlay = true }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const count = slides.length;

  const goTo = useCallback(
    (i) => {
      const next = (i + count) % count;
      setIndex(next);
      const el = trackRef.current;
      el?.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    },
    [count]
  );

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    const timer = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      const next = (current + 1) % count;
      setIndex(next);
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, count, interval]);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (count === 0) return null;

  return (
    <div style={styles.wrap}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{ ...styles.track, height }}
        className="hide-scrollbar"
      >
        {slides.map((slide, i) => (
          <div key={i} style={styles.slide}>
            {slide}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button style={{ ...styles.arrow, left: 10 }} onClick={() => goTo(index - 1)} aria-label="Previous slide">
            ‹
          </button>
          <button style={{ ...styles.arrow, right: 10 }} onClick={() => goTo(index + 1)} aria-label="Next slide">
            ›
          </button>
          <div style={styles.dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{ ...styles.dot, ...(i === index ? styles.dotActive : {}) }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  wrap: { position: 'relative', width: '100%' },
  track: {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    borderRadius: 16,
    width: '100%',
    scrollbarWidth: 'none',
  },
  slide: { flexShrink: 0, width: '100%', height: '100%', scrollSnapAlign: 'start' },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.94)',
    border: 'none',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    fontSize: 22,
    lineHeight: 1,
    color: '#1c1c1c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    cursor: 'pointer',
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 6,
    zIndex: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    border: 'none',
    background: 'rgba(255,255,255,0.6)',
    padding: 0,
    transition: 'width 0.2s',
    cursor: 'pointer',
  },
  dotActive: { background: '#fff', width: 22 },
};
