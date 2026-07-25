import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

export default function Welcome({ v }) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', background: 'radial-gradient(ellipse at 50% -10%, #F6E4DC 0%, #FBF7F0 55%)' }}>
      <Logo height={34} style={{ marginBottom: 18 }} />
      <h1 style={{ fontFamily: fonts.serif, fontWeight: 600, fontSize: 44, lineHeight: 1.15, maxWidth: 640, margin: '0 0 20px' }}>
        AI that learns <em style={{ fontStyle: 'italic', color: colors.accentDark }}>your</em> recovery patterns — and warns you before the hard moments arrive.
      </h1>
      <p style={{ fontSize: 17, color: colors.muted, maxWidth: 480, lineHeight: 1.6, margin: '0 0 36px' }}>
        Not a script. Not a generic app. A companion that gets to know how you actually recover, and predicts your high-risk windows days in advance.
      </p>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        <button onClick={v.go('signup')} style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 16, padding: '15px 34px', borderRadius: 100, border: 'none', background: colors.accent, color: '#fff', cursor: 'pointer', boxShadow: '0 10px 24px rgba(193,105,79,0.35)' }}>Sign Up</button>
        <button onClick={v.go('login')} style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 16, padding: '15px 34px', borderRadius: 100, border: '1.5px solid #2A241D', background: 'transparent', color: colors.text, cursor: 'pointer' }}>Login</button>
      </div>
      <div style={{ fontSize: 13, color: colors.mutedLight, marginBottom: 10 }}>Trusted by 12,400+ individuals and caregivers in recovery</div>
      <div style={{ fontSize: 12, color: colors.accentDark, fontWeight: 600, letterSpacing: '0.03em' }}>Private. Secure. AI-Powered.</div>
    </main>
  );
}
