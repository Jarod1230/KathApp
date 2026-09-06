import type {
  EntityDetailResponse,
  PublicEntityKind,
  SearchResponse,
} from '@kathapp/shared';

const DEFAULT_API_URL = 'http://localhost:3000';

export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, '');
  }
  return DEFAULT_API_URL;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(`API ${res.status} for ${path}`, res.status);
  }
  return (await res.json()) as T;
}

export type SearchParams = {
  q?: string;
  locale?: string;
  type?: string;
};

export function searchEntities(params: SearchParams): Promise<SearchResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.locale) qs.set('locale', params.locale);
  if (params.type) qs.set('type', params.type);
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
