import React from 'react';

/**
 * Button — variant + size aware, with loading state and hover transitions.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style,
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        ...base,
        ...variants[variant],
        ...sizes[size],
        ...(fullWidth ? { width: '100%' } : {}),
        ...(isDisabled ? { opacity: 0.55, cursor: 'not-allowed' } : {}),
        ...style,
      }}
      {...rest}
    >
      {loading ? <span style={{ opacity: 0.7 }}>…</span> : children}
    </button>
  );
}

const base = {
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  transition: 'background 0.15s, transform 0.05s, box-shadow 0.15s',
};

const variants = {
  primary: { background: 'var(--lime)', color: '#1c1c1c' },
  green: { background: 'var(--green)', color: '#fff' },
  dark: { background: '#1c1c1c', color: '#fff' },
  outline: { background: '#fff', color: 'var(--green)', border: '1.5px solid var(--green)' },
  ghost: { background: 'transparent', color: 'var(--green)' },
  danger: { background: 'var(--danger)', color: '#fff' },
};

const sizes = {
  sm: { padding: '7px 14px', fontSize: 13 },
  md: { padding: '10px 18px', fontSize: 14 },
  lg: { padding: '14px 24px', fontSize: 15 },
};
