const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('co_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('co_token', token);
  else localStorage.removeItem('co_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the careOcare server. Is the backend running?');
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null);
      window.dispatchEvent(new CustomEvent('co:auth-expired'));
    }
    throw new Error((data && (data.message || data.error)) || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  signup: (email, password, role) => request('/auth/signup', { method: 'POST', body: { email, password, role }, auth: false }),
  acceptPrivacy: (accepted) => request('/auth/privacy-acceptance', { method: 'POST', body: { accepted } }),
  login: (email, password, role) => request('/auth/login', { method: 'POST', body: { email, password, role }, auth: false }),

  saveOnboarding: (payload) => request('/users/me/onboarding', { method: 'POST', body: payload }),
  lookupUser: (email) => request(`/users/lookup?email=${encodeURIComponent(email)}`),

  sendMessage: (message) => request('/messages/send', { method: 'POST', body: { message } }),
  getHistory: (days = 30) => request(`/messages/history?days=${days}`),
  getRiskCalendar: () => request('/messages/risk-calendar'),
  getAiProgress: () => request('/messages/ai-knows-you-better'),

  linkIndividual: (individualId) => request('/caregivers/link', { method: 'POST', body: { individualId } }),
  getMyIndividuals: () => request('/caregivers/my-individuals'),
  getSupportedActivity: (individualId) => request(`/caregivers/supported/${individualId}/activity`),
  getSupportedRiskCalendar: (individualId) => request(`/caregivers/supported/${individualId}/risk-calendar`),
  sendEncouragement: (individualId, message) => request('/caregivers/send-encouragement', { method: 'POST', body: { individualId, message } }),

  getChatThread: () => request('/chat/thread'),
  pollChat: (since) => request(`/chat/poll${since ? `?since=${encodeURIComponent(since)}` : ''}`),
  sendChat: (text) => request('/chat/send', { method: 'POST', body: { text } }),
  getAvailability: () => request('/chat/availability'),
  setAvailability: (available) => request('/chat/availability', { method: 'PATCH', body: { available } }),
};

export { API_BASE };
