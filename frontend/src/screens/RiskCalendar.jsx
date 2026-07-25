import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

const levelBg = (level) => (level === 'high' ? colors.red : level === 'medium' ? colors.yellow : colors.grayLight);

export default function RiskCalendar({ v }) {
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const info = v.selDay || {};

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 32px', borderBottom: `1px solid ${colors.border}`, background: '#fff' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); v.go('dashboard')(); }} style={{ fontSize: 13, fontWeight: 700, color: colors.muted }}>← Back to Dashboard</a>
        <Logo height={20} />
      </header>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px 60px' }}>
        <h1 style={{ fontFamily: fonts.serif, fontSize: 26, margin: '0 0 6px' }}>Your 30-day risk calendar</h1>
        <p style={{ fontSize: 13, color: colors.muted, margin: '0 0 24px' }}>Built from your check-ins — not a template. Tap a day to see the reasoning.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 8 }}>
          {weekdayLabels.map((w) => (
            <div key={w} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: colors.mutedLight }}>{w}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 24 }}>
          {v.riskDaysDisplay.map((d) => {
            const selected = d.idx === v.selectedDayIdx;
            const level = d.risk_level;
            return (
              <button
                key={d.idx}
                onClick={() => v.setSelectedDayIdx(d.idx)}
                style={{ aspectRatio: '1', borderRadius: 10, border: selected ? '2px solid #2A241D' : '1px solid transparent', background: levelBg(level), color: level === 'low' ? colors.muted : '#fff', fontFamily: fonts.sans, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                {d.date}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: colors.muted, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 10, height: 10, borderRadius: 3, background: colors.grayLight }} />Low</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 10, height: 10, borderRadius: 3, background: colors.yellow }} />Medium</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 10, height: 10, borderRadius: 3, background: colors.red }} />High</div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 26 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{info.day ? `${info.day}${info.date ? ', ' + info.date : ''}` : '—'}</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>{info.reason || 'No detected patterns'}</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.accentDark }}>{info.accuracy || '—'}</div>
              <div style={{ fontSize: 11, color: colors.mutedLight }}>48-hr prediction accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.green }}>{info.multiplier || 'baseline'}</div>
              <div style={{ fontSize: 11, color: colors.mutedLight }}>risk vs. baseline</div>
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Prepare for this day</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(info.suggestions || ['No preparation needed — maintain your routine']).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', background: colors.bg, borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.accent, flexShrink: 0 }} />{s}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
