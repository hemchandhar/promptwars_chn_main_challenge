import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

const toggleStyle = (on) => ({ width: 44, height: 24, borderRadius: 100, border: 'none', background: on ? colors.green : colors.border, position: 'relative', cursor: 'pointer', padding: 0 });
const toggleDot = (on) => ({ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.15s' });
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

const TABS = [['account', 'Account'], ['notifications', 'Notifications'], ['privacy', 'Privacy & Data'], ['debug', 'Debug']];

export default function Settings({ v }) {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 32px', borderBottom: `1px solid ${colors.border}`, background: '#fff' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); v.go(v.role === 'caregiver' ? 'caregiverDashboard' : 'dashboard')(); }} style={{ fontSize: 13, fontWeight: 700, color: colors.muted }}>← Back</a>
        <Logo height={20} />
      </header>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '36px 24px 60px' }}>
        <h1 style={{ fontFamily: fonts.serif, fontSize: 26, margin: '0 0 20px' }}>Settings</h1>

        <div style={{ display: 'flex', gap: 6, background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 12, padding: 4, marginBottom: 22 }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => v.setSettingsTab(key)} style={{ flex: 1, padding: 9, borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: fonts.sans, background: v.settingsTab === key ? colors.navBg : 'transparent', color: v.settingsTab === key ? '#fff' : colors.muted }}>
              {label}
            </button>
          ))}
        </div>

        {v.settingsTab === 'account' && (
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={row}><div style={{ fontSize: 13, fontWeight: 700 }}>Email</div><div style={{ fontSize: 13, color: colors.muted }}>{v.email || '—'}</div></div>
            <div style={row}><div style={{ fontSize: 13, fontWeight: 700 }}>Password</div><a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 13, color: colors.accentDark, fontWeight: 600 }}>Change</a></div>
            <div style={row}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Two-factor authentication</div>
              <button onClick={() => v.setTwofaOn((x) => !x)} role="switch" aria-checked={v.twofaOn} style={toggleStyle(v.twofaOn)}><div style={toggleDot(v.twofaOn)} /></button>
            </div>
            <button onClick={v.logout} style={{ marginTop: 8, textAlign: 'left', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, fontWeight: 700, color: colors.text, cursor: 'pointer' }}>Log out</button>
          </div>
        )}

        {v.settingsTab === 'notifications' && (
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={row}><div style={{ fontSize: 13, fontWeight: 700 }}>Proactive intervention alerts</div><button onClick={() => v.setProactiveOn((x) => !x)} role="switch" aria-checked={v.proactiveOn} style={toggleStyle(v.proactiveOn)}><div style={toggleDot(v.proactiveOn)} /></button></div>
            <div style={row}><div style={{ fontSize: 13, fontWeight: 700 }}>Caregiver crisis notifications</div><button onClick={() => v.setCaregiverNotifOn((x) => !x)} role="switch" aria-checked={v.caregiverNotifOn} style={toggleStyle(v.caregiverNotifOn)}><div style={toggleDot(v.caregiverNotifOn)} /></button></div>
            <div style={row}><div style={{ fontSize: 13, fontWeight: 700 }}>Delivery</div><div style={{ fontSize: 13, color: colors.muted }}>Push + SMS</div></div>
          </div>
        )}

        {v.settingsTab === 'privacy' && (
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={row}><div style={{ fontSize: 13, fontWeight: 700 }}>AI analysis of my messages</div><button onClick={() => v.setAnalyticsOn((x) => !x)} role="switch" aria-checked={v.analyticsOn} style={toggleStyle(v.analyticsOn)}><div style={toggleDot(v.analyticsOn)} /></button></div>
            <button onClick={() => v.setTrainingDataOpen((x) => !x)} style={{ textAlign: 'left', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, fontWeight: 700, color: colors.text, cursor: 'pointer' }}>
              View my AI training data (last 30 days) {v.trainingDataOpen ? '▲' : '▼'}
            </button>
            {v.trainingDataOpen && (
              <div style={{ fontSize: 12, color: colors.muted, background: colors.bg, borderRadius: 10, padding: '12px 14px', lineHeight: 1.7 }}>
                {v.aiPatterns} patterns detected · {v.aiDay} days of check-ins analyzed · Personalization score {v.aiScore}%
              </div>
            )}
            <button style={{ textAlign: 'left', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, fontWeight: 700, color: colors.text, cursor: 'pointer' }}>Download my data (JSON/CSV)</button>
            <button style={{ textAlign: 'left', background: colors.redLight, border: `1px solid ${colors.redBorder}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, fontWeight: 700, color: colors.redText, cursor: 'pointer' }}>Delete all history — resets AI learning</button>
          </div>
        )}

        {v.settingsTab === 'debug' && (
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 12, color: colors.mutedLight, marginBottom: 14 }}>Last 5 Gemini API calls — for evaluator traceability</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {v.debugCalls.length === 0 && <div style={{ fontSize: 13, color: colors.mutedLight }}>No calls logged yet — trigger an emergency script from the Dashboard.</div>}
              {v.debugCalls.map((c, i) => (
                <div key={i} style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={c.onToggle} style={{ width: '100%', textAlign: 'left', padding: '12px 14px', background: colors.bg, border: 'none', cursor: 'pointer', fontFamily: fonts.sans }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: colors.mutedLight }}>{c.timestamp}</div>
                  </button>
                  {c.open && (
                    <div style={{ padding: '12px 14px', fontSize: 12, color: colors.muted, lineHeight: 1.6 }}>
                      <div style={{ marginBottom: 6 }}><b>Prompt:</b> {c.prompt}</div>
                      <div><b>Response:</b> {c.response}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Pause AI learning</div>
              <button onClick={() => v.setPauseOn((x) => !x)} role="switch" aria-checked={v.pauseOn} style={toggleStyle(v.pauseOn)}><div style={toggleDot(v.pauseOn)} /></button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
