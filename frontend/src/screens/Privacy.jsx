import { colors, fonts } from '../theme.js';

const section = (title, body) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6 }}>{body}</div>
  </div>
);

export default function Privacy({ v }) {
  const accepted = v.privacyChoice === 'accept';
  const declined = v.privacyChoice === 'decline';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 600, background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 20, padding: 36, boxShadow: '0 20px 50px rgba(42,36,29,0.06)' }}>
        <h2 style={{ fontFamily: fonts.serif, fontSize: 24, margin: '0 0 4px' }}>Your privacy, in plain language</h2>
        <div style={{ fontSize: 13, color: colors.accentDark, fontWeight: 600, marginBottom: 18 }}>This is required to continue — takes about 2 minutes to read</div>

        <div style={{ maxHeight: 320, overflowY: 'auto', border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20, background: colors.bg, marginBottom: 20 }}>
          {section('1. What data we collect', 'Your conversations, message timestamps, emotional patterns our AI detects, and voice recordings you choose to submit.')}
          {section('2. How we use it', 'Claude analyzes your check-ins and our pattern-detection system (LangGraph) looks for recurring risk windows, so the app can personalize to you specifically.')}
          {section('3. Who can access it', 'Only you, and any caregiver you explicitly authorize. Our infrastructure providers process data under strict contracts — they never read it for their own purposes.')}
          {section('4. Caregiver data', "If you're a caregiver, you see an anonymized risk timeline and crisis alerts for the person who added you — never their raw conversations, unless they set full access.")}
          {section('5. Your rights', 'Delete your data anytime, export it in full, or opt out of AI analysis while still using manual features.')}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>6. Security</div>
            <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6 }}>Encrypted in transit and at rest. Conversation data is retained for 30 days to power pattern detection, then aged out automatically.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, cursor: 'pointer', padding: 12, border: `1.5px solid ${colors.border}`, borderRadius: 10, ...(accepted ? { borderColor: colors.accent, background: colors.peach } : {}) }}>
            <input type="radio" name="privacy" checked={accepted} onChange={() => v.setPrivacyChoice('accept')} />
            <span style={{ fontWeight: 600 }}>I accept and understand</span>
          </label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, cursor: 'pointer', padding: 12, border: `1.5px solid ${colors.border}`, borderRadius: 10, ...(declined ? { borderColor: colors.red, background: colors.redLight } : {}) }}>
            <input type="radio" name="privacy" checked={declined} onChange={() => v.setPrivacyChoice('decline')} />
            <span style={{ fontWeight: 600 }}>I do not accept</span>
          </label>
        </div>

        {declined && (
          <div style={{ background: colors.redLight, borderRadius: 10, padding: 14, fontSize: 13, color: colors.redText, marginBottom: 18 }}>
            Since AI analysis requires this consent, your account will be deleted.{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); v.go('signup')(); }} style={{ color: colors.accentDark, fontWeight: 700 }}>Go back to sign up</a> if this was a mistake.
          </div>
        )}

        <button
          onClick={v.acceptPrivacy}
          disabled={!accepted || v.privacyBusy}
          style={{ width: '100%', fontFamily: fonts.sans, fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, border: 'none', background: accepted ? colors.accent : colors.border, color: accepted ? '#fff' : colors.disabledText, cursor: accepted ? 'pointer' : 'not-allowed' }}
        >
          {v.privacyBusy ? 'Saving…' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  );
}
