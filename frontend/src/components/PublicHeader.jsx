import { Link, useLocation } from 'react-router-dom';
import { colors, fonts } from '../theme.js';
import Logo from './Logo.jsx';

export default function PublicHeader({ v }) {
  const location = useLocation();
  if (v.isAuthenticated) return null;

  const linkBtn = { fontFamily: fonts.sans, fontWeight: 700, fontSize: 13, padding: '9px 18px', borderRadius: 100, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: 'rgba(251,247,240,0.92)', backdropFilter: 'blur(6px)', borderBottom: `1px solid ${colors.border}` }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <Logo height={22} />
      </Link>
      <div style={{ display: 'flex', gap: 10 }}>
        {location.pathname !== '/login' && (
          <Link to="/login" style={{ ...linkBtn, border: `1.5px solid ${colors.text}`, color: colors.text, background: 'transparent' }}>
            Login
          </Link>
        )}
        {location.pathname !== '/signup' && (
          <Link to="/signup" style={{ ...linkBtn, border: 'none', color: '#fff', background: colors.accent }}>
            Sign Up
          </Link>
        )}
      </div>
    </div>
  );
}
