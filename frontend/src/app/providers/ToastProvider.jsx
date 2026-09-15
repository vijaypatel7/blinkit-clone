import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

/**
 * Toast context — lightweight ephemeral notifications (e.g. "Added to cart").
 */
const ToastContext = createContext({ toast: () => {} });

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (message, { type = 'info', duration = 3000 } = {}) => {
      const id = ++toastId;
      setToasts((list) => [...list, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={styles.wrap}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }} onClick={() => dismiss(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = {
  wrap: {
    position: 'fixed',
    bottom: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
  },
  toast: {
    background: '#1a1a1a',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: 999,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  success: { background: '#0c831f' },
  error: { background: '#d32f2f' },
  info: { background: '#1a1a1a' },
};
