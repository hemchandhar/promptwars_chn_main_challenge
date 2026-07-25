import { Component } from 'react';
import { colors, fonts } from '../theme.js';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('careOcare crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <h1 style={{ fontFamily: fonts.serif, fontSize: 24, marginBottom: 10 }}>Something went wrong</h1>
        <p style={{ color: colors.muted, marginBottom: 20, maxWidth: 420 }}>
          This screen hit an unexpected error. Your data is safe — try reloading the page.
        </p>
        <button
          onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
          style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 100, border: 'none', background: colors.accent, color: '#fff', cursor: 'pointer' }}
        >
          Back to safety
        </button>
      </div>
    );
  }
}
