import { colors, fonts } from '../theme.js';

const textarea = { width: '100%', minHeight: 110, padding: 14, borderRadius: 10, border: `1px solid ${colors.border}`, fontFamily: fonts.sans, fontSize: 14, background: colors.bg, resize: 'vertical' };
const input = { width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${colors.border}`, fontFamily: fonts.sans, fontSize: 14, background: colors.bg };
const primaryBtn = (bg) => ({ width: '100%', fontFamily: fonts.sans, fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, border: 'none', background: bg, color: '#fff', cursor: 'pointer' });
const backBtn = { flex: 1, fontFamily: fonts.sans, fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, border: `1.5px solid ${colors.border}`, background: '#fff', color: colors.text, cursor: 'pointer' };
const nextBtn = (bg) => ({ flex: 2, fontFamily: fonts.sans, fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, border: 'none', background: bg, color: '#fff', cursor: 'pointer' });
const stepLabel = (color) => ({ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 });
const h2 = { fontFamily: fonts.serif, fontSize: 24, margin: '0 0 10px' };

function IndividualFlow({ v }) {
  const bars = [0, 1, 2, 3];
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {bars.map((i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= v.onboardStep ? colors.accent : colors.border }} />
        ))}
      </div>

      {v.onboardStep === 0 && (
        <>
          <div style={stepLabel(colors.accentDark)}>Step 1 of 4</div>
          <h2 style={h2}>Tell me about your recovery journey</h2>
          <p style={{ fontSize: 14, color: colors.muted, margin: '0 0 18px' }}>Speak or type — whatever's easier. This is the first thing your AI learns from.</p>
          <button
            onClick={v.toggleVoiceOnboard}
            aria-pressed={v.onboardListening}
            style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', width: '100%', padding: 14, borderRadius: 12, border: `1.5px solid ${v.onboardListening ? colors.accent : colors.border}`, background: v.onboardListening ? colors.peach : '#fff', color: colors.text, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: fonts.sans }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.accent, animation: v.onboardListening ? 'coPulse 1s infinite' : 'none' }} />
            {v.onboardListening ? 'Listening… tap to stop' : 'Tap to speak instead'}
          </button>
          {v.voiceError && <div style={{ fontSize: 12, color: colors.redText, marginTop: 10 }}>{v.voiceError}</div>}
          <textarea value={v.onboardJourney} onChange={(e) => v.setOnboardJourney(e.target.value)} placeholder="I've been in recovery for..." style={{ ...textarea, marginTop: 14 }} />
          <button onClick={() => v.setOnboardStep((s) => s + 1)} style={{ ...primaryBtn(colors.accent), marginTop: 20 }}>Continue</button>
        </>
      )}

      {v.onboardStep === 1 && (
        <>
          <div style={stepLabel(colors.accentDark)}>Step 2 of 4</div>
          <h2 style={h2}>What are your biggest triggers?</h2>
          <p style={{ fontSize: 14, color: colors.muted, margin: '0 0 18px' }}>Select any that apply — your risk calendar starts from these.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {v.triggerOptions.map((t) => (
              <button key={t.label} onClick={t.onClick} style={{ padding: '9px 14px', borderRadius: 100, border: `1.5px solid ${t.selected ? colors.accent : colors.border}`, background: t.selected ? colors.peach : '#fff', color: t.selected ? colors.accentDark : colors.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.sans }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => v.setOnboardStep((s) => s - 1)} style={backBtn}>Back</button>
            <button onClick={() => v.setOnboardStep((s) => s + 1)} style={nextBtn(colors.accent)}>Continue</button>
          </div>
        </>
      )}

      {v.onboardStep === 2 && (
        <>
          <div style={stepLabel(colors.accentDark)}>Step 3 of 4</div>
          <h2 style={h2}>Who's in your support system?</h2>
          <p style={{ fontSize: 14, color: colors.muted, margin: '0 0 18px' }}>Optional — you can invite caregivers later from Settings.</p>
          <input value={v.onboardSupport} onChange={(e) => v.setOnboardSupport(e.target.value)} placeholder="Name or email (optional)" style={{ ...input, marginBottom: 20 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => v.setOnboardStep((s) => s - 1)} style={backBtn}>Back</button>
            <button onClick={() => v.setOnboardStep((s) => s + 1)} style={nextBtn(colors.accent)}>Continue</button>
          </div>
        </>
      )}

      {v.onboardStep === 3 && (
        <>
          <div style={stepLabel(colors.accentDark)}>Step 4 of 4</div>
          <h2 style={h2}>Any coping strategies that have worked before?</h2>
          <textarea value={v.onboardCoping} onChange={(e) => v.setOnboardCoping(e.target.value)} placeholder="Going for a walk, calling a friend, journaling..." style={{ ...textarea, minHeight: 100, marginBottom: 20 }} />
          <button onClick={v.finishOnboardIndividual} style={primaryBtn(colors.accent)}>Your AI is ready — let's get started</button>
        </>
      )}
    </div>
  );
}

function CaregiverFlow({ v }) {
  const bars = [0, 1, 2];
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {bars.map((i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= v.caregiverStep ? colors.green : colors.border }} />
        ))}
      </div>

      {v.caregiverStep === 0 && (
        <>
          <div style={stepLabel(colors.green)}>Step 1 of 3</div>
          <h2 style={h2}>Who are you supporting?</h2>
          <input value={v.caregiverSearch} onChange={(e) => v.setCaregiverSearch(e.target.value)} placeholder="Search by email or name" style={{ ...input, marginBottom: 12 }} />
          <div style={{ fontSize: 12, color: colors.mutedLight, marginBottom: 20 }}>Or generate an invite link to send them instead.</div>
          <button onClick={() => v.setCaregiverStep((s) => s + 1)} style={primaryBtn(colors.green)}>Continue</button>
        </>
      )}

      {v.caregiverStep === 1 && (
        <>
          <div style={stepLabel(colors.green)}>Step 2 of 3</div>
          <h2 style={{ ...h2, marginBottom: 14 }}>What's your role?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {v.caregiverRoleOptions.map((r) => (
              <button key={r.label} onClick={r.onClick} style={{ textAlign: 'left', padding: '13px 16px', borderRadius: 10, border: `1.5px solid ${r.selected ? colors.green : colors.border}`, background: r.selected ? colors.greenLight : '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.sans }}>
                {r.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => v.setCaregiverStep((s) => s - 1)} style={backBtn}>Back</button>
            <button onClick={() => v.setCaregiverStep((s) => s + 1)} style={nextBtn(colors.green)}>Continue</button>
          </div>
        </>
      )}

      {v.caregiverStep === 2 && (
        <>
          <div style={stepLabel(colors.green)}>Step 3 of 3</div>
          <h2 style={{ ...h2, marginBottom: 14 }}>What can you see?</h2>
          <label style={{ display: 'block', padding: 14, borderRadius: 10, border: `1.5px solid ${colors.border}`, marginBottom: 10, cursor: 'pointer', ...(v.caregiverPermission === 'full' ? { borderColor: colors.green, background: colors.greenLight } : {}) }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
              <input type="radio" name="perm" checked={v.caregiverPermission === 'full'} onChange={() => v.setCaregiverPermission('full')} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Full access</span>
            </div>
            <div style={{ fontSize: 12, color: colors.mutedLight, paddingLeft: 24 }}>Emotional timeline, crisis alerts, and all messages</div>
          </label>
          <label style={{ display: 'block', padding: 14, borderRadius: 10, border: `1.5px solid ${colors.border}`, marginBottom: 22, cursor: 'pointer', ...(v.caregiverPermission === 'limited' ? { borderColor: colors.green, background: colors.greenLight } : {}) }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
              <input type="radio" name="perm" checked={v.caregiverPermission === 'limited'} onChange={() => v.setCaregiverPermission('limited')} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Crisis alerts only</span>
            </div>
            <div style={{ fontSize: 12, color: colors.mutedLight, paddingLeft: 24 }}>Notified only when a crisis script is accessed</div>
          </label>
          {v.linkError && <div style={{ fontSize: 12, color: colors.red, marginBottom: 12 }}>{v.linkError}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => v.setCaregiverStep((s) => s - 1)} style={backBtn}>Back</button>
            <button onClick={v.finishOnboardCaregiver} style={nextBtn(colors.green)}>Go to Dashboard</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Onboarding({ v }) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 540, background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 20, padding: 36, boxShadow: '0 20px 50px rgba(42,36,29,0.06)' }}>
        {v.role === 'individual' ? <IndividualFlow v={v} /> : <CaregiverFlow v={v} />}
      </div>
    </main>
  );
}
