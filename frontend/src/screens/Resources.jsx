import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

const hotlines = [
  { name: '988 Suicide & Crisis Lifeline', detail: 'Call or text 988 — free, confidential, 24/7 support for anyone in crisis.', href: 'tel:988' },
  { name: 'SAMHSA National Helpline', detail: '1-800-662-4357 — free, confidential treatment referral & information, 24/7, 365 days.', href: 'tel:18006624357' },
  { name: 'Crisis Text Line', detail: 'Text HOME to 741741 to reach a trained crisis counselor, 24/7.', href: 'sms:741741&body=HOME' },
];

const articles = [
  {
    title: 'Understanding triggers',
    body: "Triggers are people, places, feelings, or situations that increase urges to use. They're not a sign of weakness — noticing and naming them (like this app's risk calendar does) is one of the most effective relapse-prevention tools available.",
  },
  {
    title: "What a lapse doesn't mean",
    body: 'A lapse is a single use after a period of recovery; a relapse is a return to regular use. Neither erases progress already made. Most people who reach long-term recovery had at least one lapse along the way — what matters most is getting support quickly afterward.',
  },
  {
    title: 'Building a support network',
    body: "Recovery is more durable with people around you — sponsors, therapists, support groups, family. If you haven't yet, this app lets you invite a caregiver from Settings so someone else can see your risk windows and check in when it matters.",
  },
  {
    title: 'For caregivers: supporting without enabling',
    body: "Support means listening without judgment, encouraging treatment, and taking care of your own wellbeing too. It doesn't mean covering up consequences or managing someone else's recovery for them. Al-Anon and Nar-Anon (see links below) are built specifically for families and caregivers.",
  },
];

const links = [
  { label: 'SAMHSA.gov — treatment locator & resources', href: 'https://www.samhsa.gov/find-help/national-helpline' },
  { label: 'NIDA — National Institute on Drug Abuse', href: 'https://nida.nih.gov/' },
  { label: 'Al-Anon — support for families & friends', href: 'https://al-anon.org/' },
  { label: 'Nar-Anon — support for families of people who use drugs', href: 'https://www.nar-anon.org/' },
];

export default function Resources({ v }) {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 32px', borderBottom: `1px solid ${colors.border}`, background: '#fff' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); v.go(v.role === 'caregiver' ? 'caregiverDashboard' : 'dashboard')(); }} style={{ fontSize: 13, fontWeight: 700, color: colors.muted }}>← Back</a>
        <Logo height={20} />
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '36px 24px 60px' }}>
        <h1 style={{ fontFamily: fonts.serif, fontSize: 26, margin: '0 0 6px' }}>Resources & education</h1>
        <p style={{ fontSize: 13, color: colors.muted, margin: '0 0 28px' }}>If you're in immediate danger, please use one of the numbers below — they're staffed by real people, right now.</p>

        <section aria-labelledby="hotlines-heading" style={{ marginBottom: 32 }}>
          <h2 id="hotlines-heading" style={{ fontSize: 12, fontWeight: 700, color: colors.accentDark, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
            Crisis lines — available now
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {hotlines.map((h) => (
              <a
                key={h.name}
                href={h.href}
                style={{ display: 'block', background: colors.peach, border: `1px solid ${colors.accent}`, borderRadius: 14, padding: 16, textDecoration: 'none', color: colors.text }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: colors.accentDark, marginBottom: 4 }}>{h.name}</div>
                <div style={{ fontSize: 13, color: colors.muted }}>{h.detail}</div>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="learn-heading" style={{ marginBottom: 32 }}>
          <h2 id="learn-heading" style={{ fontSize: 12, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
            Understanding recovery
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {articles.map((a) => (
              <div key={a.title} style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6 }}>{a.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="links-heading">
          <h2 id="links-heading" style={{ fontSize: 12, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
            Outside organizations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: colors.accentDark, fontWeight: 600, textDecoration: 'none' }}>
                {l.label} ↗
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
