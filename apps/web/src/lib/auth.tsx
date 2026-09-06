import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser, Role } from '@kathapp/shared';
import { roleAtLeast } from '@kathapp/shared';
import {
  clearAuthStorage,
  devLogin,
  fetchMe,
  getAccessToken,
  getStoredUser,
  onUnauthorized,
  setAccessToken,
  setStoredUser,
} from './api';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, role?: Role) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const storedToken = getAccessToken();
      const storedUser = getStoredUser();
      if (!storedToken) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setReady(true);
        }
        return;
      }

      if (!cancelled) {
        setToken(storedToken);
        if (storedUser) setUser(storedUser);
      }

      try {
        const me = await fetchMe();
        if (cancelled) return;
        setUser(me);
        setStoredUser(me);
      } catch {
        if (cancelled) return;
        clearAuthStorage();
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // A token can expire while the app is open. api.ts clears the storage on a
  // 401 and tells us here, so the UI stops presenting a signed-in user.
  useEffect(
    () =>
      onUnauthorized(() => {
        setToken(null);
        setUser(null);
      }),
    [],
  );

  const login = useCallback(async (email: string, role?: Role) => {
    const session = await devLogin(email.trim(), role);
    setAccessToken(session.accessToken);
    setStoredUser(session.user);
    setToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, ready, login, logout }),
    [user, token, ready, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

// Re-exported so existing imports from this module keep working; the single
// definition lives in @kathapp/shared.
export { roleAtLeast };
