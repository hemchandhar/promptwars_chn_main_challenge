import { useEffect, useRef } from 'react';
import { colors, fonts } from '../theme.js';
import Logo from '../components/Logo.jsx';

export default function Chat({ v }) {
  const listRef = useRef(null);
  const backPath = v.role === 'caregiver' ? 'caregiverDashboard' : 'dashboard';

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [v.chatMessages]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      v.sendChatMessage();
    }
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 32px', borderBottom: `1px solid ${colors.border}`, background: '#fff' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); v.go(backPath)(); }} style={{ fontSize: 13, fontWeight: 700, color: colors.muted }}>← Back</a>
        <Logo height={20} />
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 40px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 137px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontFamily: fonts.serif, fontSize: 22, margin: '0 0 4px' }}>
              {v.chatCounterpart ? (v.chatCounterpart.email?.split('@')[0] || 'Chat') : 'Chat'}
            </h1>
            {v.chatCounterpart?.role === 'caregiver' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: v.chatCounterpart.available ? colors.green : colors.mutedLight, fontWeight: 700 }}>
                <span
                  aria-hidden="true"
                  style={{ width: 8, height: 8, borderRadius: '50%', background: v.chatCounterpart.available ? colors.green : colors.grayLight, display: 'inline-block' }}
                />
                {v.chatCounterpart.available ? 'Online now' : 'Offline'}
              </div>
            )}
            {v.chatCounterpart?.role === 'individual' && (
              <div style={{ fontSize: 12, color: colors.mutedLight }}>The person you're supporting</div>
            )}
          </div>
        </div>

        {v.chatLoaded && !v.chatCounterpart && (
          <div style={{ fontSize: 13, color: colors.mutedLight, background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 20, textAlign: 'center' }}>
            {v.role === 'caregiver'
              ? "You're not linked to anyone yet — link an individual from Settings to start chatting."
              : "No caregiver linked yet — invite one from Settings to start chatting."}
          </div>
        )}

        {v.chatCounterpart && (
          <>
            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              style={{ flex: 1, overflowY: 'auto', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}
            >
              {v.chatMessages.length === 0 && (
                <div style={{ fontSize: 13, color: colors.mutedLight, textAlign: 'center', margin: 'auto' }}>No messages yet — say hello.</div>
              )}
              {v.chatMessages.map((m, i) => {
                const mine = m.senderRole === v.role;
                return (
                  <div key={m._id || i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '75%', padding: '10px 14px', borderRadius: 14,
                        background: mine ? colors.accent : colors.bg,
                        color: mine ? '#fff' : colors.text,
                        fontSize: 14, lineHeight: 1.5,
                      }}
                    >
                      {m.text}
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <label htmlFor="chat-input" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Message</label>
              <textarea
                id="chat-input"
                value={v.chatInput}
                onChange={(e) => v.setChatInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a message…"
                rows={1}
                style={{ flex: 1, resize: 'none', padding: '12px 14px', borderRadius: 12, border: `1px solid ${colors.border}`, fontFamily: fonts.sans, fontSize: 14, background: colors.bg }}
              />
              <button
                onClick={v.sendChatMessage}
                disabled={!v.chatInput.trim() || v.chatSending}
                style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 14, padding: '0 20px', borderRadius: 12, border: 'none', background: v.chatInput.trim() ? colors.accent : colors.border, color: v.chatInput.trim() ? '#fff' : colors.disabledText, cursor: v.chatInput.trim() ? 'pointer' : 'not-allowed' }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
