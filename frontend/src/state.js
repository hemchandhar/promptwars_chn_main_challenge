import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, setToken } from './api.js';
import { colors } from './theme.js';

const TRIGGERS = ['Boredom', 'Social isolation', 'Stress', 'Certain times of day', 'Conflict', 'Loneliness'];
const CAREGIVER_ROLES = ['Family member', 'Sponsor', 'Therapist', 'Friend'];

const FALLBACK_SCRIPT =
  "I know this moment feels heavy. Take one slow breath with me. You've gotten through hard moments before — let's find one small, doable next step together.";

export const SCREEN_PATHS = {
  welcome: '/',
  signup: '/signup',
  privacy: '/privacy',
  login: '/login',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  emergency: '/emergency',
  riskCalendar: '/risk-calendar',
  caregiverDashboard: '/caregiver-dashboard',
  settings: '/settings',
  chat: '/chat',
  resources: '/resources',
};

const PATH_SCREENS = Object.fromEntries(Object.entries(SCREEN_PATHS).map(([k, v]) => [v, k]));

function levelColor(level) {
  return level === 'high' ? colors.red : level === 'medium' ? colors.yellow : colors.grayLight;
}

export function useCareOcare() {
  const navigate = useNavigate();
  const location = useLocation();
  const screen = PATH_SCREENS[location.pathname] || 'welcome';
  const [role, setRole] = useState(localStorage.getItem('co_role') || 'individual');

  // auth
  const [userId, setUserId] = useState(localStorage.getItem('co_user_id') || null);
  const [email, setEmail] = useState(localStorage.getItem('co_email') || '');
  const isAuthenticated = !!userId;

  // signup
  const [signupRole, setSignupRole] = useState(null);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupAgree, setSignupAgree] = useState(false);
  const [signupError, setSignupError] = useState(null);
  const [signupBusy, setSignupBusy] = useState(false);

  // privacy
  const [privacyChoice, setPrivacyChoice] = useState(null);
  const [privacyBusy, setPrivacyBusy] = useState(false);

  // login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loginRole, setLoginRole] = useState('individual');
  const [loginBusy, setLoginBusy] = useState(false);

  // onboarding - individual
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardJourney, setOnboardJourney] = useState('');
  const [onboardTriggers, setOnboardTriggers] = useState([]);
  const [onboardSupport, setOnboardSupport] = useState('');
  const [onboardCoping, setOnboardCoping] = useState('');
  const [onboardListening, setOnboardListening] = useState(false);

  // onboarding - caregiver
  const [caregiverStep, setCaregiverStep] = useState(0);
  const [caregiverSearch, setCaregiverSearch] = useState('');
  const [caregiverRole, setCaregiverRole] = useState(null);
  const [caregiverPermission, setCaregiverPermission] = useState('full');
  const [linkedIndividualId, setLinkedIndividualId] = useState(localStorage.getItem('co_individual_id') || null);
  const [linkedIndividualEmail, setLinkedIndividualEmail] = useState(localStorage.getItem('co_individual_email') || '');
  const [linkError, setLinkError] = useState(null);

  // dashboard / ai meter
  const [aiDay, setAiDay] = useState(1);
  const [aiScore, setAiScore] = useState(0);
  const [aiPatterns, setAiPatterns] = useState(0);

  // voice / emergency
  const [voiceState, setVoiceState] = useState('idle');
  const [currentScript, setCurrentScript] = useState(FALLBACK_SCRIPT);
  const [scriptTrace, setScriptTrace] = useState(null);
  const [wasCrisis, setWasCrisis] = useState(false);
  const [triedShown, setTriedShown] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("I'm struggling right now");
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(true);
  const autoSubmitRef = useRef(true);
  const voiceRecognitionRef = useRef(null);
  useEffect(() => { autoSubmitRef.current = autoSubmit; }, [autoSubmit]);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const spokenScriptRef = useRef(null);

  // risk calendar
  const [selectedDayIdx, setSelectedDayIdx] = useState(4);
  const [riskDaysData, setRiskDaysData] = useState([]);
  const [riskLoading, setRiskLoading] = useState(false);

  // caregiver dashboard
  const [activityFeed, setActivityFeed] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [supportedMessages, setSupportedMessages] = useState([]);
  const [supportedRiskDays, setSupportedRiskDays] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityBusy, setAvailabilityBusy] = useState(false);

  // chat
  const [chatCounterpart, setChatCounterpart] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const lastChatTimestampRef = useRef(null);

  // settings
  const [settingsTab, setSettingsTab] = useState('account');
  const [analyticsOn, setAnalyticsOn] = useState(true);
  const [trainingDataOpen, setTrainingDataOpen] = useState(false);
  const [twofaOn, setTwofaOn] = useState(false);
  const [proactiveOn, setProactiveOn] = useState(true);
  const [caregiverNotifOn, setCaregiverNotifOn] = useState(true);
  const [pauseOn, setPauseOn] = useState(false);
  const [debugOpenIdx, setDebugOpenIdx] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);

  const go = useCallback((s) => () => { window.scrollTo(0, 0); navigate(SCREEN_PATHS[s] || s); }, [navigate]);

  const resetSession = useCallback(() => {
    setToken(null);
    localStorage.removeItem('co_user_id');
    localStorage.removeItem('co_email');
    localStorage.removeItem('co_role');
    setUserId(null);
    setEmail('');
  }, []);

  // if a token expires or is rejected mid-session, drop back to login
  useEffect(() => {
    const onExpired = () => {
      resetSession();
      navigate('/login');
    };
    window.addEventListener('co:auth-expired', onExpired);
    return () => window.removeEventListener('co:auth-expired', onExpired);
  }, [resetSession, navigate]);

  // ---- data loaders ----
  const loadAiProgress = useCallback(async () => {
    try {
      const p = await api.getAiProgress();
      setAiDay(p.training_day || 1);
      setAiScore(p.personalization_score || 0);
      setAiPatterns(p.patterns_detected || 0);
    } catch (e) { /* non-fatal */ }
  }, []);

  const loadRiskCalendar = useCallback(async () => {
    setRiskLoading(true);
    try {
      const days = await api.getRiskCalendar();
      setRiskDaysData(days);
    } catch (e) { /* non-fatal */ }
    setRiskLoading(false);
  }, []);

  const loadCaregiverActivity = useCallback(async (individualId) => {
    if (!individualId) return;
    try {
      const data = await api.getSupportedActivity(individualId);
      const feed = (data.messages || []).map((m) => ({
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        text: m.generated_script ? 'Emergency script accessed' : `Check-in logged (${m.emotional_state || 'unknown'} state)`,
      }));
      setActivityFeed(feed);
      setAlerts(data.alerts || []);
      setSupportedMessages(data.messages || []);
    } catch (e) { /* non-fatal */ }
  }, []);

  const loadSupportedRiskCalendar = useCallback(async (individualId) => {
    if (!individualId) return;
    try {
      const days = await api.getSupportedRiskCalendar(individualId);
      setSupportedRiskDays(days);
    } catch (e) { /* non-fatal */ }
  }, []);

  const loadMessageHistory = useCallback(async () => {
    try {
      const h = await api.getHistory(30);
      setMessageHistory(h || []);
    } catch (e) { /* non-fatal */ }
  }, []);

  // poll caregiver activity every 5s while on caregiver dashboard
  useEffect(() => {
    if (!userId || screen !== 'caregiverDashboard' || !linkedIndividualId) return;
    loadCaregiverActivity(linkedIndividualId);
    const t = setInterval(() => loadCaregiverActivity(linkedIndividualId), 5000);
    return () => clearInterval(t);
  }, [userId, screen, linkedIndividualId, loadCaregiverActivity]);

  // risk calendar changes slowly — fetch once per visit, not on every 5s poll
  useEffect(() => {
    if (!userId || screen !== 'caregiverDashboard' || !linkedIndividualId) return;
    loadSupportedRiskCalendar(linkedIndividualId);
  }, [userId, screen, linkedIndividualId, loadSupportedRiskCalendar]);

  // ---- presence (caregiver "I am available") ----
  const loadAvailability = useCallback(async () => {
    try {
      const res = await api.getAvailability();
      setIsAvailable(!!res.available);
    } catch (e) { /* non-fatal */ }
  }, []);

  const toggleAvailability = async () => {
    if (availabilityBusy) return;
    setAvailabilityBusy(true);
    const next = !isAvailable;
    try {
      await api.setAvailability(next);
      setIsAvailable(next);
    } catch (e) { /* non-fatal */ }
    setAvailabilityBusy(false);
  };

  useEffect(() => {
    if (!userId || role !== 'caregiver') return;
    if (screen !== 'caregiverDashboard' && screen !== 'chat') return;
    loadAvailability();
  }, [userId, role, screen, loadAvailability]);

  // ---- chat ----
  const loadChatThread = useCallback(async () => {
    try {
      const res = await api.getChatThread();
      setChatCounterpart(res.counterpart);
      setChatMessages(res.messages || []);
      if (res.messages?.length) lastChatTimestampRef.current = res.messages[res.messages.length - 1].timestamp;
      setChatLoaded(true);
    } catch (e) { /* non-fatal */ }
  }, []);

  const pollChat = useCallback(async () => {
    try {
      const res = await api.pollChat(lastChatTimestampRef.current);
      if (res.counterpart) setChatCounterpart(res.counterpart);
      if (res.messages?.length) {
        setChatMessages((prev) => [...prev, ...res.messages]);
        lastChatTimestampRef.current = res.messages[res.messages.length - 1].timestamp;
      }
    } catch (e) { /* non-fatal */ }
  }, []);

  useEffect(() => {
    if (!userId || screen !== 'chat') return;
    setChatLoaded(false);
    loadChatThread();
    const t = setInterval(pollChat, 4000);
    return () => clearInterval(t);
  }, [userId, screen, loadChatThread, pollChat]);

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatSending) return;
    setChatSending(true);
    setChatInput('');
    try {
      const msg = await api.sendChat(text);
      setChatMessages((prev) => [...prev, msg]);
      lastChatTimestampRef.current = msg.timestamp;
    } catch (e) { /* non-fatal */ }
    setChatSending(false);
  };

  useEffect(() => {
    if (!userId) return;
    if (screen === 'dashboard') { loadAiProgress(); loadRiskCalendar(); }
    if (screen === 'riskCalendar') loadRiskCalendar();
    if (screen === 'settings' && settingsTab === 'debug') loadMessageHistory();
  }, [userId, screen, settingsTab, loadAiProgress, loadRiskCalendar, loadMessageHistory]);

  // ---- auth handlers ----
  const signupDisabled = !(signupRole && signupEmail && signupPassword && signupPassword === signupConfirm && signupAgree);

  const submitSignup = async () => {
    if (signupDisabled || signupBusy) return;
    setSignupBusy(true);
    setSignupError(null);
    try {
      const res = await api.signup(signupEmail, signupPassword, signupRole);
      setToken(res.token);
      localStorage.setItem('co_user_id', res.userId);
      localStorage.setItem('co_email', res.email);
      localStorage.setItem('co_role', signupRole);
      setUserId(res.userId);
      setEmail(res.email);
      setRole(signupRole);
      go('privacy')();
    } catch (e) {
      setSignupError(e.message);
    }
    setSignupBusy(false);
  };

  const acceptPrivacy = async () => {
    const accepted = privacyChoice === 'accept';
    if (!accepted || privacyBusy) return;
    setPrivacyBusy(true);
    try {
      await api.acceptPrivacy(true);
      go('onboarding')();
    } catch (e) {
      setSignupError(e.message);
    }
    setPrivacyBusy(false);
  };

  const submitLogin = async () => {
    if (loginBusy) return;
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await api.login(loginEmail, loginPassword, loginRole);
      setToken(res.token);
      localStorage.setItem('co_user_id', res.userId);
      localStorage.setItem('co_email', loginEmail);
      localStorage.setItem('co_role', res.role);
      setUserId(res.userId);
      setEmail(loginEmail);
      setRole(res.role);
      setAiDay(res.aiTrainingDay || 1);
      if (res.role === 'caregiver') {
        try {
          const mine = await api.getMyIndividuals();
          if (mine && mine.length) {
            setLinkedIndividualId(mine[0].userId);
            setLinkedIndividualEmail(mine[0].email);
            localStorage.setItem('co_individual_id', mine[0].userId);
            localStorage.setItem('co_individual_email', mine[0].email);
          }
        } catch (e) { /* non-fatal */ }
        go('caregiverDashboard')();
      } else {
        go('dashboard')();
      }
    } catch (e) {
      setLoginError(e.message || 'Login failed');
    }
    setLoginBusy(false);
  };

  const logout = () => {
    resetSession();
    navigate('/login');
  };

  // ---- onboarding ----
  const onboardRecognitionRef = useRef(null);
  const onboardBaseTextRef = useRef('');

  const toggleVoiceOnboard = () => {
    if (onboardListening) {
      onboardRecognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input isn\'t supported in this browser — please type instead.');
      return;
    }

    onboardBaseTextRef.current = onboardJourney ? onboardJourney.trim() + ' ' : '';
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onresult = (ev) => {
      let finalText = '';
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const chunk = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalText += chunk + ' ';
        else interim += chunk;
      }
      if (finalText) onboardBaseTextRef.current += finalText;
      setOnboardJourney((onboardBaseTextRef.current + interim).trim());
    };
    rec.onerror = () => setOnboardListening(false);
    rec.onend = () => setOnboardListening(false);

    onboardRecognitionRef.current = rec;
    try {
      rec.start();
      setOnboardListening(true);
    } catch (e) {
      setOnboardListening(false);
    }
  };

  const finishOnboardIndividual = async () => {
    try {
      await api.saveOnboarding({
        journey: onboardJourney,
        triggers: onboardTriggers,
        supportContact: onboardSupport,
        copingStrategies: onboardCoping.split(/[,.\n]/).map((s) => s.trim()).filter(Boolean),
      });
    } catch (e) { /* non-fatal */ }
    setOnboardStep(0);
    go('dashboard')();
  };

  const finishOnboardCaregiver = async () => {
    setLinkError(null);
    try {
      if (caregiverSearch.includes('@')) {
        const found = await api.lookupUser(caregiverSearch.trim());
        if (found && found.userId) {
          await api.linkIndividual(found.userId);
          setLinkedIndividualId(found.userId);
          setLinkedIndividualEmail(found.email);
          localStorage.setItem('co_individual_id', found.userId);
          localStorage.setItem('co_individual_email', found.email);
        }
      }
    } catch (e) {
      setLinkError('Could not find that person yet — you can link them later from Settings.');
    }
    setCaregiverStep(0);
    go('caregiverDashboard')();
  };

  // ---- voice / emergency ----
  const requestScript = async (message) => {
    try {
      const res = await api.sendMessage(message);
      setCurrentScript(res.generated_script || FALLBACK_SCRIPT);
      setScriptTrace(res.trace || null);
      setWasCrisis(!!res.is_crisis);
    } catch (e) {
      setCurrentScript(FALLBACK_SCRIPT);
      setScriptTrace(null);
      setWasCrisis(false);
    }
  };

  const submitVoiceTranscript = async (overrideText) => {
    const text = (overrideText ?? voiceTranscript).trim();
    if (!text) return;
    setLastTranscript(text);
    setVoiceState('analyzing');
    await requestScript(text);
    setVoiceState('idle');
    setVoiceTranscript('');
    setTriedShown(false);
    setTraceOpen(false);
    go('emergency')();
  };

  const startVoiceFlow = () => {
    if (voiceState !== 'idle' && voiceState !== 'reviewing') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceTranscript('');

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.continuous = true;
      rec.maxAlternatives = 1;
      setVoiceState('listening');

      let finalText = '';
      rec.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const chunk = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) finalText += chunk + ' ';
          else interim += chunk;
        }
        setVoiceTranscript((finalText + interim).trim());
      };
      rec.onerror = () => {
        voiceRecognitionRef.current = null;
        setVoiceState((s) => (s === 'listening' ? (finalText.trim() ? 'reviewing' : 'idle') : s));
      };
      rec.onend = () => {
        voiceRecognitionRef.current = null;
        const text = finalText.trim();
        if (!text) {
          setVoiceState('idle');
          return;
        }
        if (autoSubmitRef.current) {
          submitVoiceTranscript(text);
        } else {
          setVoiceState('reviewing');
        }
      };
      voiceRecognitionRef.current = rec;
      try { rec.start(); } catch (e) { setVoiceState('idle'); }
    } else {
      // no browser speech support — fall back to manual typing
      setVoiceState('reviewing');
    }
  };

  const stopVoiceFlow = () => {
    voiceRecognitionRef.current?.stop();
  };

  const tryScript = () => setTriedShown(true);
  const regenerateScript = async () => {
    setTriedShown(false);
    await requestScript(lastTranscript + ' (still struggling, give me a different idea)');
  };
  const toggleTrace = () => setTraceOpen((v) => !v);

  const speakScript = useCallback(() => {
    if (!('speechSynthesis' in window) || !currentScript) {
      setVoicePlaying(false);
      setVoiceError('Voice playback isn\'t supported in this browser — read the script below instead.');
      return;
    }
    setVoiceError(null);
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(currentScript);
    u.rate = 0.98;
    u.onstart = () => setVoicePlaying(true);
    u.onend = () => setVoicePlaying(false);
    u.onerror = () => {
      setVoicePlaying(false);
      setVoiceError('Couldn\'t play audio on this device — no voice available. Read the script below instead.');
    };

    // Chrome (especially on Linux) can silently drop speak() if it fires before
    // voices finish loading, or if there's no TTS engine installed on the OS at
    // all. Detect that case instead of showing a fake "playing" state forever.
    const watchdog = setTimeout(() => {
      if (!window.speechSynthesis.speaking) {
        setVoicePlaying(false);
        setVoiceError('No audio output detected — your browser/device may not have a text-to-speech voice installed. Read the script below instead.');
      }
    }, 1200);
    u.onstart = () => { clearTimeout(watchdog); setVoicePlaying(true); };

    window.speechSynthesis.speak(u);
  }, [currentScript]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setVoicePlaying(false);
  };

  // auto-play the script the moment it's ready on the Emergency screen —
  // the UI tells the user audio is playing, so it actually needs to start playing
  useEffect(() => {
    if (screen !== 'emergency' || !currentScript) return;
    if (spokenScriptRef.current === currentScript) return;
    spokenScriptRef.current = currentScript;
    speakScript();
  }, [screen, currentScript, speakScript]);

  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  // ---- caregiver dashboard actions ----
  const sendQuickTemplate = async (text) => {
    if (!linkedIndividualId) return;
    try {
      await api.sendEncouragement(linkedIndividualId, text);
      setActivityFeed((f) => [{ time: 'Just now', text: `Encouragement sent: "${text.slice(0, 30)}…"` }, ...f]);
    } catch (e) { /* non-fatal */ }
  };

  // ---- derived / computed values (mirrors original renderVals) ----
  const pw = signupPassword;
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;
  const barColor = (n) => (strength >= n ? (strength === 1 ? colors.red : strength === 2 ? colors.yellow : colors.green) : colors.border);
  const strengthLabel = pw.length === 0 ? 'Enter a password' : strength === 1 ? 'Weak — add more characters' : strength === 2 ? 'Medium strength' : 'Strong password';

  const triggerOptions = TRIGGERS.map((label) => {
    const selected = onboardTriggers.includes(label);
    return {
      label,
      selected,
      onClick: () => setOnboardTriggers((t) => (selected ? t.filter((x) => x !== label) : [...t, label])),
    };
  });

  const caregiverRoleOptions = CAREGIVER_ROLES.map((label) => ({
    label,
    selected: caregiverRole === label,
    onClick: () => setCaregiverRole(label),
  }));

  // Real data only — while it's loading (or before the AI has anything to go on) this is
  // an honest "no pattern yet" placeholder, never a fabricated weekly shape.
  const riskDaysDisplay = riskDaysData.length
    ? riskDaysData.map((d, i) => ({ ...d, idx: i }))
    : Array.from({ length: 30 }).map((_, i) => {
        const date = new Date(Date.now() - (29 - i) * 86400000);
        return {
          date: date.toLocaleDateString('en-US', { day: 'numeric' }),
          day: date.toLocaleDateString('en-US', { weekday: 'long' }),
          risk_level: 'low',
          reason: riskLoading ? 'Loading your risk calendar…' : 'No detected patterns yet — keep checking in',
          idx: i,
        };
      });

  const weekStrip = riskDaysDisplay.slice(-7).map((d) => ({ label: (d.day || '').slice(0, 1), level: d.risk_level }));
  const topRiskDay = riskDaysDisplay.slice(-7).reduce((top, d) => {
    const rank = { high: 2, medium: 1, low: 0 };
    return !top || rank[d.risk_level] > rank[top.risk_level] ? d : top;
  }, null);

  const selDay = riskDaysDisplay[selectedDayIdx] || riskDaysDisplay[riskDaysDisplay.length - 1];

  // Real 7-day trajectory for the caregiver's supported individual, built from their
  // actual logged emotional_state — no fabricated numbers, no data means no bar.
  const EMOTION_SCORE = { low: 30, medium: 60, high: 90 };
  const supportedTrajectory = Array.from({ length: 7 }).map((_, i) => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - (6 - i));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayMsgs = supportedMessages.filter((m) => {
      const t = new Date(m.timestamp);
      return t >= dayStart && t < dayEnd;
    });
    const label = dayStart.toLocaleDateString('en-US', { weekday: 'narrow' });
    if (!dayMsgs.length) return { label, height: 4, hasData: false };
    const avg = dayMsgs.reduce((sum, m) => sum + (EMOTION_SCORE[m.emotional_state] || 50), 0) / dayMsgs.length;
    return { label, height: Math.max(10, Math.round(avg)), hasData: true };
  });
  const supportedTrajectoryHasData = supportedTrajectory.some((d) => d.hasData);

  const aiMeterLabel =
    aiDay < 10
      ? 'Baseline knowledge — still learning your basics'
      : aiDay < 25
      ? 'Building understanding — noticing your weekly rhythms'
      : 'Deep personalization — predicting your risk windows with real confidence';

  const debugCalls = messageHistory
    .filter((m) => m.generated_script)
    .slice(0, 5)
    .map((m, i) => ({
      title: 'Emergency script generation',
      timestamp: new Date(m.script_generated_at || m.timestamp).toLocaleString(),
      prompt: `30-day history + "${m.content}" transcript → generate personalized coping script`,
      response: (m.generated_script || '').slice(0, 90) + '…',
      open: debugOpenIdx === i,
      onToggle: () => setDebugOpenIdx((cur) => (cur === i ? null : i)),
    }));

  return {
    // navigation
    screen, go, role, setRole,
    // auth identity
    userId, email, isAuthenticated,
    // signup
    signupRole, setSignupRole, signupEmail, setSignupEmail, signupPassword, setSignupPassword,
    signupConfirm, setSignupConfirm, signupAgree, setSignupAgree, signupDisabled, signupError, signupBusy,
    barColor, strengthLabel, submitSignup,
    // privacy
    privacyChoice, setPrivacyChoice, acceptPrivacy, privacyBusy,
    // login
    loginEmail, setLoginEmail, loginPassword, setLoginPassword, loginRemember, setLoginRemember,
    loginError, loginRole, setLoginRole, submitLogin, loginBusy,
    // onboarding individual
    onboardStep, setOnboardStep, onboardJourney, setOnboardJourney, onboardTriggers, triggerOptions,
    onboardSupport, setOnboardSupport, onboardCoping, setOnboardCoping, onboardListening, toggleVoiceOnboard,
    finishOnboardIndividual,
    // onboarding caregiver
    caregiverStep, setCaregiverStep, caregiverSearch, setCaregiverSearch, caregiverRole, caregiverRoleOptions,
    caregiverPermission, setCaregiverPermission, finishOnboardCaregiver, linkError,
    linkedIndividualId, linkedIndividualEmail,
    // dashboard
    aiDay, aiScore, aiPatterns, aiMeterLabel, weekStrip, topRiskDay, levelColor,
    voiceState, startVoiceFlow, stopVoiceFlow, voiceTranscript, setVoiceTranscript, submitVoiceTranscript,
    autoSubmit, setAutoSubmit,
    // emergency
    currentScript, scriptTrace, triedShown, tryScript, regenerateScript, traceOpen, toggleTrace, speakScript, wasCrisis,
    voicePlaying, voiceError, stopSpeaking,
    // risk calendar
    selectedDayIdx, setSelectedDayIdx, riskDaysDisplay, selDay, riskLoading,
    // caregiver dashboard
    activityFeed, alerts, sendQuickTemplate, supportedRiskDays, supportedTrajectory, supportedTrajectoryHasData,
    isAvailable, toggleAvailability, availabilityBusy,
    // chat
    chatCounterpart, chatMessages, chatInput, setChatInput, chatSending, chatLoaded, sendChatMessage,
    // settings
    settingsTab, setSettingsTab, analyticsOn, setAnalyticsOn, trainingDataOpen, setTrainingDataOpen,
    twofaOn, setTwofaOn, proactiveOn, setProactiveOn, caregiverNotifOn, setCaregiverNotifOn,
    pauseOn, setPauseOn, debugCalls, logout,
  };
}
