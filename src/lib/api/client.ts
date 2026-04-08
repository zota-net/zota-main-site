import { useUserStore } from '@/lib/store/user-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || `${API_BASE_URL}/auth`;
const BASE_OPS_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_OPS_API_BASE_URL || `${API_BASE_URL}/bop`;
const WALLET_API_BASE_URL = process.env.NEXT_PUBLIC_WALLET_API_BASE_URL || `${API_BASE_URL}/wallet`;
const MIKROTIK_API_BASE_URL = process.env.NEXT_PUBLIC_MIKROTIK_API_BASE_URL || `${API_BASE_URL}/mikrotik`;
const DEVICES_API_BASE_URL = process.env.NEXT_PUBLIC_DEVICES_API_BASE_URL || `${API_BASE_URL}/devices`;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || '';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

function resolveApiUrl(endpoint: string) {
  const servicePath = endpoint.replace(/^\/(auth|bop|wallet|mikrotik|devices)/, '');
  if (endpoint.startsWith('/auth/')) {
    return `${AUTH_API_BASE_URL}${servicePath}`;
  }
  if (endpoint.startsWith('/bop/')) {
    return `${BASE_OPS_API_BASE_URL}${servicePath}`;
  }
  if (endpoint.startsWith('/wallet/')) {
    return `${WALLET_API_BASE_URL}${servicePath}`;
  }
  if (endpoint.startsWith('/mikrotik/')) {
    return `${MIKROTIK_API_BASE_URL}${servicePath}`;
  }
  if (endpoint.startsWith('/devices/')) {
    return `${DEVICES_API_BASE_URL}${servicePath}`;
  }
  return `${API_BASE_URL}${endpoint}`;
}

async function apiFetch<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };

  // Interceptor: attach auth token to every outgoing request
  if (!skipAuth) {
    const session = useUserStore.getState().session;
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }
  }

  // Attach client_id if available
  const user = useUserStore.getState().user;
  const clientId = (user as { client_id?: string } | null)?.client_id || CLIENT_ID;
  if (clientId) {
    headers['client_id'] = clientId;
  }

  const url = resolveApiUrl(endpoint);

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 — force logout
  if (response.status === 401) {
    useUserStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  let data: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  const isSuccessStatus = response.ok || response.status === 304;
  if (!isSuccessStatus) {
    const message = (data as { message?: string })?.message || response.statusText || 'Request failed';
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

// Convenience methods
export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
