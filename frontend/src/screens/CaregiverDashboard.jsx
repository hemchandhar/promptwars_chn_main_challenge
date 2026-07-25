import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

export default function CaregiverDashboard({ v }) {
  const name = v.linkedIndividualEmail ? v.linkedIndividualEmail.split('@')[0] : 'your person';
  const riskDaysMini = v.supportedRiskDays;

  const quickTemplates = [
    "You're doing great — I noticed you reached out Friday, and that took courage.",
    "I'm proud of you for making it through this week.",
    'Thinking of you today — no need to respond, just wanted you to know.',
  ];

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 32px', borderBottom: `1px solid ${colors.border}`, background: '#fff' }}>
        <Logo height={20} />
        <nav aria-label="Primary" style={{ display: 'flex', gap: 22, alignItems: 'center', fontSize: 13, fontWeight: 600, color: colors.muted }}>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('caregiverDashboard')(); }} style={{ color: colors.text }}>Caregiver Dashboard</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('chat')(); }} style={{ color: colors.muted }}>Chat</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('resources')(); }} style={{ color: colors.muted }}>Resources</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.go('settings')(); }} style={{ color: colors.muted }}>Settings</a>
          <a href="#" onClick={(e) => { e.preventDefault(); v.logout(); }} style={{ color: colors.muted }}>Log out</a>
          <div aria-hidden="true" style={{ width: 32, height: 32, borderRadius: '50%', background: colors.greenLight, color: colors.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
            {(v.email || 'S').slice(0, 1).toUpperCase()}
          </div>
        </nav>
      </header>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '36px 24px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: fonts.serif, fontSize: 26, margin: '0 0 4px' }}>Supporting {name}</h1>
            <p style={{ fontSize: 13, color: colors.muted, margin: 0 }}>Anonymized activity — updates in real time.</p>
          </div>
          <button
            onClick={v.toggleAvailability}
            disabled={v.availabilityBusy}
            role="switch"
            aria-checked={v.isAvailable}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              padding: '10px 16px', borderRadius: 100, border: `1.5px solid ${v.isAvailable ? colors.green : colors.border}`,
              background: v.isAvailable ? colors.greenLight : '#fff', cursor: 'pointer', fontFamily: fonts.sans,
            }}
          >
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: v.isAvailable ? colors.green : colors.grayLight }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: v.isAvailable ? colors.green : colors.muted }}>
              {v.isAvailable ? "You're available for chat" : 'Show as available'}
            </span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.green, animation: 'coPulse 1.6s infinite' }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Live activity</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto' }}>
              {(v.activityFeed.length ? v.activityFeed : [{ time: '—', text: 'No activity yet' }]).map((a, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${colors.greenLight}`, paddingLeft: 12, animation: 'coFade 0.4s ease' }}>
                  <div style={{ fontSize: 11, color: colors.mutedLight, fontWeight: 700 }}>{a.time}</div>
                  <div style={{ fontSize: 13, color: colors.text }}>{a.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>7-day trajectory</div>
            {v.supportedTrajectoryHasData ? (
              <>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100, marginBottom: 12 }}>
                  {v.supportedTrajectory.map((d, i) => (
                    <div
                      key={i}
                      title={d.hasData ? `${d.label}: logged check-in` : `${d.label}: no check-ins`}
                      style={{ flex: 1, height: `${d.height}%`, background: d.hasData ? colors.green : colors.grayLight, borderRadius: '4px 4px 0 0', opacity: d.hasData ? 0.85 : 0.4 }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: colors.muted, fontWeight: 600 }}>Built from their actual check-ins this week — taller bars mean higher reported stress.</div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: colors.mutedLight, padding: '20px 0' }}>No check-ins logged in the last 7 days yet.</div>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 22, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Risk calendar (shared view)</div>
          {riskDaysMini.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
              {riskDaysMini.map((d, i) => (
                <div key={i} title={`${d.day}: ${d.reason}`} style={{ aspectRatio: '1', borderRadius: 4, background: d.risk_level === 'high' ? colors.red : d.risk_level === 'medium' ? colors.yellow : colors.grayLight }} />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: colors.mutedLight }}>Loading their risk calendar…</div>
          )}
        </div>

        <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Quick response templates</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quickTemplates.map((text, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.bg, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 13, maxWidth: '70%' }}>"{text}"</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => v.sendQuickTemplate(text)} style={{ fontSize: 12, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: 'none', background: colors.green, color: '#fff', cursor: 'pointer' }}>Send</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
