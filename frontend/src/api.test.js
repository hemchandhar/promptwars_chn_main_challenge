import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, setToken } from './api.js';

function mockFetchOnce(status, body) {
  global.fetch = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }));
}

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('sends requests under the /api prefix', async () => {
    mockFetchOnce(200, { ok: true });
    await api.getRiskCalendar();
    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/messages/risk-calendar');
  });

  it('attaches the bearer token when one is stored', async () => {
    setToken('test-token-123');
    mockFetchOnce(200, { ok: true });
    await api.getAiProgress();
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer test-token-123');
  });

  it('does not attach a token for auth:false calls like signup', async () => {
    setToken('should-not-be-sent');
    mockFetchOnce(200, { token: 'new', userId: '1', email: 'a@b.com' });
    await api.signup('a@b.com', 'password123', 'individual');
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('throws with the server-provided message on failure', async () => {
    mockFetchOnce(400, { message: 'Email already registered' });
    await expect(api.signup('a@b.com', 'password123', 'individual')).rejects.toThrow('Email already registered');
  });

  it('clears the token and emits co:auth-expired on a 401', async () => {
    setToken('expired-token');
    mockFetchOnce(401, { message: 'Unauthorized' });
    const listener = vi.fn();
    window.addEventListener('co:auth-expired', listener);

    await expect(api.getAiProgress()).rejects.toThrow();

    expect(localStorage.getItem('co_token')).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('co:auth-expired', listener);
  });

  it('surfaces a clear error when the network request itself fails', async () => {
    global.fetch = vi.fn(async () => { throw new Error('network down'); });
    await expect(api.getRiskCalendar()).rejects.toThrow('Cannot reach the careOcare server');
  });
});
