import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

const toggleTrackStyle = (on) => ({ width: 36, height: 20, borderRadius: 100, border: 'none', background: on ? colors.green : 'rgba(255,255,255,0.18)', position: 'relative', cursor: 'pointer', padding: 0, flexShrink: 0 });
const toggleDotStyle = (on) => ({ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 19 : 3, transition: 'left 0.15s' });

export default function Dashboard({ v }) {
  const voicePulse = v.voiceState === 'listening';
  const statusMap = {
    idle: 'Tap to speak, or in crisis — zero typing needed',
    listening: v.autoSubmit ? 'Listening… I\'ll send this once you stop talking' : 'Listening… tap the mic again when you\'re done',
    reviewing: 'Review what I heard, then send when ready',
    analyzing: 'Analyzing your patterns…',
    delivered: '',
  };
  const showTranscriptBox = v.voiceState === 'listening' || v.voiceState === 'reviewing' || v.voiceTranscript;

  const handleMicClick = () => {
    if (v.voiceState === 'listening') v.stopVoiceFlow();
    else if (v.voiceState === 'idle' || v.voiceState === 'reviewing') v.startVoiceFlow();
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 32px', borderBottom: `1px solid ${colors.border}`, background: '#fff' }}>
        <Logo height={20} />
        <nav aria-label="Primary" style={{ display: 'flex', gap: 22, alignItems: 'center', fontSize: 13, fontWeight: 600, color: colors.muted }}>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('dashboard')(); }} style={{ color: colors.text }}>Dashboard</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('riskCalendar')(); }} style={{ color: colors.muted }}>Risk Calendar</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('chat')(); }} style={{ color: colors.muted }}>Chat</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('resources')(); }} style={{ color: colors.muted }}>Resources</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('settings')(); }} style={{ color: colors.muted }}>Settings</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.logout(); }} style={{ color: colors.muted }}>Log out</a>
          <div aria-hidden="true" style={{ width: 32, height: 32, borderRadius: '50%', background: colors.peach, color: colors.accentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
            {(v.email || 'JM').slice(0, 2).toUpperCase()}
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 60px' }}>
        <h1 style={{ fontFamily: fonts.serif, fontSize: 28, margin: '0 0 4px' }}>Good evening{v.email ? `, ${v.email.split('@')[0]}` : ''}</h1>
        <p style={{ fontSize: 14, color: colors.muted, margin: '0 0 32px' }}>Here's where things stand today.</p>

        <div style={{ background: colors.navBg, borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#C9BFAE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Speak your concern, anytime</div>
          </div>

          <button
            onClick={handleMicClick}
            disabled={v.voiceState === 'analyzing'}
            aria-label={v.voiceState === 'listening' ? 'Stop recording' : 'Start speaking to careOcare'}
            aria-pressed={v.voiceState === 'listening'}
            style={{ position: 'relative', width: 84, height: 84, borderRadius: '50%', border: 'none', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: v.voiceState === 'analyzing' ? 'default' : 'pointer' }}
          >
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: colors.accent, display: voicePulse ? 'block' : 'none', animation: voicePulse ? 'coPulse 1.2s infinite' : 'none' }} />
            {v.voiceState === 'listening' ? (
              <div style={{ position: 'relative', zIndex: 1, width: 18, height: 18, borderRadius: 4, background: '#fff' }} />
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                <rect x="9" y="2" width="6" height="12" rx="3" fill="#fff" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </button>
          <div style={{ fontSize: 14, color: colors.navText, marginTop: 16, minHeight: 20 }}>{statusMap[v.voiceState]}</div>

          {showTranscriptBox && (
            <div style={{ marginTop: 18, textAlign: 'left' }}>
              <textarea
                value={v.voiceTranscript}
                onChange={(e) => v.setVoiceTranscript(e.target.value)}
                placeholder="What you say will show up here — you can edit it before sending."
                style={{ width: '100%', minHeight: 70, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: colors.navText, fontFamily: fonts.sans, fontSize: 14, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => v.submitVoiceTranscript()}
                  disabled={!v.voiceTranscript.trim()}
                  style={{ flex: 1, fontFamily: fonts.sans, fontWeight: 700, fontSize: 14, padding: '11px 16px', borderRadius: 10, border: 'none', background: v.voiceTranscript.trim() ? colors.accent : 'rgba(255,255,255,0.15)', color: v.voiceTranscript.trim() ? '#fff' : '#8a8072', cursor: v.voiceTranscript.trim() ? 'pointer' : 'not-allowed' }}
                >
                  Send now
                </button>
                <button
                  onClick={() => { v.stopVoiceFlow(); v.setVoiceTranscript(''); }}
                  style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 14, padding: '11px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent', color: colors.navText, cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <label style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 18, cursor: 'pointer' }}>
            <button type="button" role="switch" aria-checked={v.autoSubmit} onClick={() => v.setAutoSubmit((x) => !x)} style={toggleTrackStyle(v.autoSubmit)}>
              <div style={toggleDotStyle(v.autoSubmit)} />
            </button>
            <span style={{ fontSize: 12, color: '#C9BFAE', fontWeight: 600 }}>Auto-submit when I stop speaking</span>
          </label>
        </div>

        <div onClick={v.go('riskCalendar')} style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 24, marginBottom: 24, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Risk this week</div>
            <div style={{ fontSize: 12, color: colors.accentDark, fontWeight: 700 }}>View full calendar →</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {v.weekStrip.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: v.levelColor(d.level), margin: '0 auto' }} />
                <div style={{ fontSize: 11, color: colors.mutedLight, marginTop: 6, fontWeight: 600 }}>{d.label}</div>
              </div>
            ))}
          </div>
          {v.topRiskDay && v.topRiskDay.risk_level !== 'low' ? (
            <div style={{ fontSize: 12, color: colors.redText, background: colors.redLight, borderRadius: 8, padding: '10px 12px', marginTop: 16 }}>
              {v.topRiskDay.day}: {v.topRiskDay.reason || 'elevated risk detected'}. Tap to see why.
            </div>
          ) : (
            <div style={{ fontSize: 12, color: colors.muted, background: colors.bg, borderRadius: 8, padding: '10px 12px', marginTop: 16 }}>
              No elevated risk detected this week yet — keep checking in so the AI can learn your rhythms.
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>AI Knows You Better</div>
            <div style={{ fontSize: 12, color: colors.green, fontWeight: 700 }}>Day {v.aiDay} / 30</div>
          </div>
          <div style={{ height: 10, background: colors.greenLight, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ height: '100%', width: `${Math.round((v.aiDay / 30) * 100)}%`, background: colors.green, borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 13, color: colors.muted }}>{v.aiMeterLabel}</div>
        </div>
      </main>
    </div>
  );
}
