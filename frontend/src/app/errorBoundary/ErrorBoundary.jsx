import React from 'react';

/**
 * Top-level error boundary.
 *
 * Catches render errors anywhere in the tree and shows a recoverable fallback
 * instead of a blank screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, forward to an error-tracking service.
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrap}>
          <h1>Something went wrong</h1>
          <p className="muted">Please refresh the page or try again.</p>
          <button style={styles.button} onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    fontFamily: 'inherit',
    padding: 24,
    textAlign: 'center',
  },
  button: {
    background: '#f8cb46',
    border: 'none',
    padding: '10px 24px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
  },
};
