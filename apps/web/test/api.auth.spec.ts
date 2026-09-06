import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACCESS_TOKEN_KEY,
  AUTH_USER_KEY,
  apiFetch,
  getAccessToken,
  onUnauthorized,
  setAccessToken,
  setStoredUser,
} from '../src/lib/api';

function respondWith(status: number) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify({ message: 'nope' }),
    json: async () => ({}),
  });
}

function signIn() {
  setAccessToken('a-token');
  setStoredUser({ id: 'u1', email: 'someone@example.org', role: 'reviewer' });
}

describe('apiFetch authentication handling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('attaches the bearer token when a session is stored', async () => {
    signIn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/v1/auth/me');

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer a-token');
  });

  it('sends no Authorization header when signed out', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/v1/search?q=x');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('clears the stored session when a request comes back 401', async () => {
    signIn();
    vi.stubGlobal('fetch', respondWith(401));

    await expect(apiFetch('/v1/suggestions')).rejects.toThrow();

    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
  });

  it('tells the app about a 401 so the UI stops showing a signed-in user', async () => {
    signIn();
    vi.stubGlobal('fetch', respondWith(401));
    const listener = vi.fn();
    const unsubscribe = onUnauthorized(listener);

    await expect(apiFetch('/v1/suggestions')).rejects.toThrow();

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('stops notifying after unsubscribing', async () => {
    signIn();
    vi.stubGlobal('fetch', respondWith(401));
    const listener = vi.fn();
    onUnauthorized(listener)();

    await expect(apiFetch('/v1/suggestions')).rejects.toThrow();

    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps the session on a 403, which means wrong role rather than bad token', async () => {
    signIn();
    vi.stubGlobal('fetch', respondWith(403));

    await expect(apiFetch('/v1/suggestions')).rejects.toThrow();

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('a-token');
  });

  it('keeps the session on a server error', async () => {
    signIn();
    vi.stubGlobal('fetch', respondWith(500));

    await expect(apiFetch('/v1/suggestions')).rejects.toThrow();

    expect(getAccessToken()).toBe('a-token');
  });
});
