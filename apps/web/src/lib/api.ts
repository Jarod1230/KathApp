import type {
  AuthSession,
  AuthUser,
  DevLoginRequest,
  EntityDetailResponse,
  PublicEntityKind,
  PublishGateCode,
  Role,
  SearchResponse,
  SuggestionCreateRequest,
  SuggestionRejectRequest,
  SuggestionStatus,
  SuggestionView,
} from '@kathapp/shared';

const DEFAULT_API_URL = 'http://localhost:3000';

export const ACCESS_TOKEN_KEY = 'kathapp.accessToken';
export const AUTH_USER_KEY = 'kathapp.user';

export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, '');
  }
  return DEFAULT_API_URL;
}

export function getAccessToken(): string | null {
  try {
    const value = localStorage.getItem(ACCESS_TOKEN_KEY);
    return value && value.trim().length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  try {
    if (token && token.trim().length > 0) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (
      parsed &&
      typeof parsed.id === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.role === 'string'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function clearAuthStorage(): void {
  setAccessToken(null);
  setStoredUser(null);
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
    readonly gates?: PublishGateCode[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function extractGates(body: unknown): PublishGateCode[] | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const record = body as Record<string, unknown>;
  if (Array.isArray(record.gates)) {
    return record.gates as PublishGateCode[];
  }
  const nested = record.message;
  if (nested && typeof nested === 'object') {
    const msg = nested as Record<string, unknown>;
    if (Array.isArray(msg.gates)) {
      return msg.gates as PublishGateCode[];
    }
  }
  return undefined;
}

function extractMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const record = body as Record<string, unknown>;
  if (typeof record.message === 'string') return record.message;
  if (record.message && typeof record.message === 'object') {
    const nested = record.message as Record<string, unknown>;
    if (typeof nested.message === 'string') return nested.message;
  }
  if (typeof record.error === 'string') return record.error;
  return fallback;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const token = getAccessToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (init?.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let body: unknown;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = text;
      }
    }
    const message = extractMessage(body, `API ${res.status} for ${path}`);
    throw new ApiError(message, res.status, body, extractGates(body));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export type SearchParams = {
  q?: string;
  locale?: string;
  type?: string;
  limit?: number;
  offset?: number;
};

export function searchEntities(params: SearchParams): Promise<SearchResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.locale) qs.set('locale', params.locale);
  if (params.type) qs.set('type', params.type);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));
  const query = qs.toString();
  return apiFetch<SearchResponse>(`/v1/search${query ? `?${query}` : ''}`);
}

const KIND_TO_PATH: Record<PublicEntityKind, string> = {
  saint: 'saints',
  miracle: 'miracles',
  source: 'sources',
};

export function getEntityDetail(
  kind: PublicEntityKind,
  id: string,
  locale?: string,
): Promise<EntityDetailResponse> {
  const qs = new URLSearchParams();
  if (locale) qs.set('locale', locale);
  const query = qs.toString();
  const segment = KIND_TO_PATH[kind];
  return apiFetch<EntityDetailResponse>(
    `/v1/${segment}/${encodeURIComponent(id)}${query ? `?${query}` : ''}`,
  );
}

export function devLogin(
  email: string,
  role?: Role,
): Promise<AuthSession> {
  const body: DevLoginRequest = { email };
  if (role) body.role = role;
  return apiFetch<AuthSession>('/v1/auth/dev-login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/v1/auth/me');
}

export function createSuggestion(
  request: SuggestionCreateRequest,
): Promise<SuggestionView> {
  return apiFetch<SuggestionView>('/v1/suggestions', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function listSuggestions(
  status?: SuggestionStatus | string,
): Promise<SuggestionView[]> {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  const query = qs.toString();
  return apiFetch<SuggestionView[]>(
    `/v1/suggestions${query ? `?${query}` : ''}`,
  );
}

export function getSuggestion(id: string): Promise<SuggestionView> {
  return apiFetch<SuggestionView>(
    `/v1/suggestions/${encodeURIComponent(id)}`,
  );
}

export function acceptSuggestion(id: string): Promise<SuggestionView> {
  return apiFetch<SuggestionView>(
    `/v1/suggestions/${encodeURIComponent(id)}/accept`,
    { method: 'POST' },
  );
}

export function rejectSuggestion(
  id: string,
  body?: SuggestionRejectRequest,
): Promise<SuggestionView> {
  return apiFetch<SuggestionView>(
    `/v1/suggestions/${encodeURIComponent(id)}/reject`,
    {
      method: 'POST',
      body: JSON.stringify(body ?? {}),
    },
  );
}
