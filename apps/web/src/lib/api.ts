import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  ApiError,
  TokenData,
} from '@/features/auth/types';
import { tokenStorage } from './token';

const REFRESH_ENDPOINT = 'auth/refresh';
let refreshPromise: Promise<boolean> | null = null;

/**
 * =========================
 * BASE URL CONFIG
 * =========================
 */

// Normalize URL (hapus trailing slash)
function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

// Normalize path (pastikan diawali "/" dan tanpa trailing slash)
function normalizeBasePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '';

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
}

// 🔥 BASE URL (WAJIB)
function getApiBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
}

// 🔥 BASE PATH (WAJIB FIX)
function getApiBasePath(): string {
  return normalizeBasePath(
    process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1'
  );
}

// Gabungkan path
function buildApiPath(basePath: string, endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint.slice(1)
    : endpoint;

  return `${basePath}/${cleanEndpoint}`;
}

/**
 * =========================
 * LOCALE
 * =========================
 */

function getCurrentLocale(): string {
  if (typeof window === 'undefined') return 'en';

  const pathname = window.location.pathname;
  const match = pathname.match(/^\/(id|en)/);
  if (match) return match[1];

  return navigator.language.startsWith('id') ? 'id' : 'en';
}

/**
 * =========================
 * REQUEST CORE
 * =========================
 */

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  locale?: string;
}

async function executeRequest(
  url: string,
  options: RequestInit,
  headers: Record<string, string>
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers,
  });
}

function buildUnauthorizedResponse<T>(message: string): ApiResponse<T> {
  return {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message,
      message_en: message,
    },
    timestamp: new Date().toISOString(),
    request_id: `req_${Date.now()}`,
  };
}

async function parseApiResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return (await res.json()) as ApiResponse<T>;
  }

  const raw = await res.text();
  return {
    success: false,
    error: {
      code: `HTTP_${res.status}`,
      message: raw || `HTTP ${res.status}`,
      message_en: raw || `HTTP ${res.status}`,
    },
    timestamp: new Date().toISOString(),
    request_id: `req_${Date.now()}`,
  };
}

/**
 * =========================
 * REFRESH TOKEN
 * =========================
 */

async function refreshAccessToken(
  baseUrl: string,
  basePath: string,
  locale: string
): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  const url = `${baseUrl}${buildApiPath(basePath, REFRESH_ENDPOINT)}`;

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
    headers: {
      'Content-Type': 'application/json',
      'X-Locale': locale,
    },
  });

  if (!res.ok) return false;

  const data = (await res.json()) as ApiResponse<TokenData>;
  if (!data.success || !data.data) return false;

  tokenStorage.setAccessToken(data.data.access_token, data.data.expires_in);
  tokenStorage.setRefreshToken(data.data.refresh_token);

  return true;
}

async function refreshAccessTokenSingleFlight(
  baseUrl: string,
  basePath: string,
  locale: string
): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(baseUrl, basePath, locale).finally(
      () => (refreshPromise = null)
    );
  }

  return refreshPromise;
}

/**
 * =========================
 * MAIN REQUEST
 * =========================
 */

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const basePath = getApiBasePath();

  const url = `${baseUrl}${buildApiPath(basePath, endpoint)}`;
  const { requireAuth = true, locale, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentLocale = locale || getCurrentLocale();
  headers['X-Locale'] = currentLocale;

  if (requireAuth) {
    if (tokenStorage.isTokenExpired()) {
      const refreshed = await refreshAccessTokenSingleFlight(
        baseUrl,
        basePath,
        currentLocale
      );

      if (!refreshed) {
        return buildUnauthorizedResponse('Session expired');
      }
    }

    const token = tokenStorage.getAccessToken();
    if (!token) {
      return buildUnauthorizedResponse('Token missing');
    }

    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await executeRequest(url, fetchOptions, headers);

    if (res.status === 204) {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}`,
      };
    }

    const data = await parseApiResponse<T>(res);

    if (!res.ok) {
      return data;
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network error',
        message_en: 'Network error',
      },
      timestamp: new Date().toISOString(),
      request_id: `req_${Date.now()}`,
    };
  }
}

/**
 * =========================
 * AUTH
 * =========================
 */

export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const res = await apiRequest<LoginResponseData>('auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    requireAuth: false,
  });

  if (res.success && res.data) {
    tokenStorage.setTokens(
      {
        access_token: res.data.access_token,
        refresh_token: res.data.refresh_token,
        expires_in: res.data.expires_in,
        token_type: res.data.token_type,
      },
      res.data.user
    );
  }

  return res as LoginResponse;
}

export function logout() {
  tokenStorage.clear();
}

export function isAuthenticated(): boolean {
  return !!tokenStorage.getAccessToken();
}