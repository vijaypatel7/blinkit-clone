import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useSuggestQuery } from '../../store/api.js';
import { recentSearches } from '../../services/requestCache.js';

/**
 * SearchBar — white search input (sits on the green header) with debounced
 * type-ahead suggestions and recent-search chips.
 */
export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(query, 280);
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const { data } = useSuggestQuery(debounced, { skip: debounced.trim().length < 2 });
  const recents = recentSearches.list();

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submit = (term) => {
    const t = term?.trim();
    if (!t) return;
    recentSearches.add(t);
    setQuery(t);
    setFocused(false);
    navigate(`/search?q=${encodeURIComponent(t)}`);
  };

  const suggestions = focused && debounced.trim().length >= 2 ? data || [] : [];

  return (
    <div ref={boxRef} style={{ position: 'relative', width: '100%' }}>
      <div style={styles.box}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && submit(query)}
          placeholder='Search "milk"'
          style={styles.input}
          aria-label="Search products"
        />
      </div>

      {focused && (suggestions.length > 0 || recents.length > 0) && (
        <div style={styles.dropdown}>
          {suggestions.length > 0 ? (
            suggestions.map((s) => (
              <button key={s.id} style={styles.item} onMouseDown={() => submit(s.name)}>
                <span style={{ opacity: 0.5 }}>🔎</span>
                <span style={{ textAlign: 'left' }}>
                  {s.name}
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)' }}>{s.brand}</span>
                </span>
              </button>
            ))
          ) : (
            <>
              <p style={{ fontSize: 12, fontWeight: 700, margin: '6px 12px', color: 'var(--text-muted)' }}>
                Recent searches
              </p>
              {recents.map((r) => (
                <button key={r} style={styles.item} onMouseDown={() => submit(r)}>
                  <span style={{ opacity: 0.5 }}>🕘</span> {r}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  box: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fff',
    borderRadius: 12,
    padding: '0 16px',
    color: 'var(--text-muted)',
  },
  input: {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    outline: 'none',
    fontSize: 15,
    color: '#1c1c1c',
    background: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: '#fff',
    borderRadius: 12,
    boxShadow: 'var(--shadow-lg)',
    padding: 8,
    zIndex: 300,
    maxHeight: 380,
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    border: 'none',
    background: 'none',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
    color: '#1c1c1c',
    cursor: 'pointer',
    textAlign: 'left',
  },
};
