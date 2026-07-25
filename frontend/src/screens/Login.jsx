import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

const input = { width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${colors.border}`, fontFamily: fonts.sans, fontSize: 14, marginBottom: 16, background: colors.bg };
const label = { display: 'block', fontSize: 12, fontWeight: 700, color: colors.muted, marginBottom: 6 };

export default function Login({ v }) {
  const tabStyle = (active) => ({ flex: 1, padding: 8, borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: fonts.sans, background: active ? '#fff' : 'transparent', color: active ? colors.text : colors.mutedLight });

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 20, padding: 36, boxShadow: '0 20px 50px rgba(42,36,29,0.06)' }}>
        <Logo height={26} style={{ marginBottom: 10 }} />
        <h2 style={{ fontFamily: fonts.serif, fontSize: 26, margin: '0 0 22px' }}>Welcome back</h2>

        <div style={{ display: 'flex', gap: 8, background: colors.bg, borderRadius: 10, padding: 4, marginBottom: 20 }}>
          <button onClick={() => v.setLoginRole('individual')} style={tabStyle(v.loginRole === 'individual')}>Individual</button>
          <button onClick={() => v.setLoginRole('caregiver')} style={tabStyle(v.loginRole === 'caregiver')}>Caregiver</button>
        </div>

        <label style={label}>EMAIL</label>
        <input value={v.loginEmail} onChange={(e) => v.setLoginEmail(e.target.value)} type="email" placeholder="you@example.com" style={input} />
        <label style={label}>PASSWORD</label>
        <input value={v.loginPassword} onChange={(e) => v.setLoginPassword(e.target.value)} type="password" placeholder="Your password" style={{ ...input, marginBottom: 10 }} />

        {v.loginError && <div style={{ fontSize: 13, color: colors.red, marginBottom: 10, fontWeight: 600 }}>{v.loginError}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: colors.muted, cursor: 'pointer' }}>
            <input type="checkbox" checked={v.loginRemember} onChange={(e) => v.setLoginRemember(e.target.checked)} />
            Remember me
          </label>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 13, color: colors.accentDark, fontWeight: 600 }}>Forgot password?</a>
        </div>

        <button onClick={v.submitLogin} disabled={v.loginBusy} style={{ width: '100%', fontFamily: fonts.sans, fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, border: 'none', background: colors.accent, color: '#fff', cursor: 'pointer' }}>
          {v.loginBusy ? 'Logging in…' : 'Login'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: colors.mutedLight }}>
          Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); v.go('signup')(); }} style={{ color: colors.accentDark, fontWeight: 600 }}>Sign up</a>
        </div>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: colors.mutedLighter }}>Demo accounts: individual@demo.com / caregiver@demo.com (password123)</div>
      </div>
    </main>
  );
}
