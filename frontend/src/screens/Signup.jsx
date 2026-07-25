import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

const input = { width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${colors.border}`, fontFamily: fonts.sans, fontSize: 14, marginBottom: 16, background: colors.bg };
const label = { display: 'block', fontSize: 12, fontWeight: 700, color: colors.muted, marginBottom: 6 };

export default function Signup({ v }) {
  const cardStyle = (active) => ({ flex: 1, textAlign: 'left', padding: 14, borderRadius: 12, border: `1.5px solid ${active ? colors.accent : colors.border}`, background: active ? colors.peach : '#fff', cursor: 'pointer', fontFamily: fonts.sans });

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 20, padding: 36, boxShadow: '0 20px 50px rgba(42,36,29,0.06)' }}>
        <Logo height={26} style={{ marginBottom: 10 }} />
        <h2 style={{ fontFamily: fonts.serif, fontSize: 26, margin: '0 0 22px' }}>Create your account</h2>

        <div style={{ fontSize: 13, fontWeight: 700, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>I am a...</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <button onClick={() => v.setSignupRole('individual')} style={cardStyle(v.signupRole === 'individual')}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Individual in Recovery</div>
            <div style={{ fontSize: 12, color: colors.mutedLight }}>Get personalized support</div>
          </button>
          <button onClick={() => v.setSignupRole('caregiver')} style={cardStyle(v.signupRole === 'caregiver')}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Caregiver</div>
            <div style={{ fontSize: 12, color: colors.mutedLight }}>Support someone in recovery</div>
          </button>
        </div>

        <label style={label}>EMAIL</label>
        <input value={v.signupEmail} onChange={(e) => v.setSignupEmail(e.target.value)} type="email" placeholder="you@example.com" style={input} />

        <label style={label}>PASSWORD</label>
        <input value={v.signupPassword} onChange={(e) => v.setSignupPassword(e.target.value)} type="password" placeholder="At least 8 characters" style={{ ...input, marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <div style={{ height: 4, flex: 1, borderRadius: 2, background: v.barColor(1) }} />
          <div style={{ height: 4, flex: 1, borderRadius: 2, background: v.barColor(2) }} />
          <div style={{ height: 4, flex: 1, borderRadius: 2, background: v.barColor(3) }} />
        </div>
        <div style={{ fontSize: 12, color: colors.mutedLight, marginBottom: 16 }}>{v.strengthLabel}</div>

        <label style={label}>CONFIRM PASSWORD</label>
        <input value={v.signupConfirm} onChange={(e) => v.setSignupConfirm(e.target.value)} type="password" placeholder="Re-enter password" style={{ ...input, marginBottom: 18 }} />

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: colors.muted, marginBottom: 22, cursor: 'pointer' }}>
          <input type="checkbox" checked={v.signupAgree} onChange={(e) => v.setSignupAgree(e.target.checked)} style={{ marginTop: 2 }} />
          <span>I agree to careOcare's <a href="#" onClick={(e) => e.preventDefault()} style={{ color: colors.accentDark, fontWeight: 600 }}>Privacy Policy &amp; Terms of Service</a></span>
        </label>

        {v.signupError && <div style={{ fontSize: 13, color: colors.red, fontWeight: 600, marginBottom: 14 }}>{v.signupError}</div>}

        <button
          onClick={v.submitSignup}
          disabled={v.signupDisabled || v.signupBusy}
          style={{ width: '100%', fontFamily: fonts.sans, fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, border: 'none', background: v.signupDisabled ? colors.border : colors.accent, color: v.signupDisabled ? colors.disabledText : '#fff', cursor: v.signupDisabled ? 'not-allowed' : 'pointer' }}
        >
          {v.signupBusy ? 'Creating…' : 'Create Account'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: colors.mutedLight }}>
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); v.go('login')(); }} style={{ color: colors.accentDark, fontWeight: 600 }}>Log in</a>
        </div>
      </div>
    </main>
  );
}
