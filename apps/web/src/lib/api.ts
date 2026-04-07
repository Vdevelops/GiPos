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

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function normalizeBasePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') {
    return '';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}

function buildApiPath(basePath: string, endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  if (!basePath) {
    return `/${cleanEndpoint}`;
  }
  return `${basePath}/${cleanEndpoint}`;
}

/**
 * Get API base URL from environment variable
 * Defaults to localhost:8080 for development
 */
function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window === 'undefined') {
    return normalizeBaseUrl(configuredUrl || 'http://localhost:8080');
  }

  return normalizeBaseUrl(configuredUrl || 'http://localhost:8080');
}

/**
 * Get API base path from environment variable
 * Defaults to /api/v1 for standard API versioning
 */
function getApiBasePath(): string {
  const configuredPath = process.env.NEXT_PUBLIC_API_BASE_PATH;
  if (typeof configuredPath === 'undefined') {
    return '/api/v1';
  }
  return normalizeBasePath(configuredPath);
}

/**
 * Get current locale from browser or default to 'en'
 */
function getCurrentLocale(): string {
  if (typeof window === 'undefined') return 'en';
  
  // Try to get locale from pathname
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/(id|en)/);
  if (localeMatch) {
    return localeMatch[1];
  }
  
  // Fallback to browser language
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'id' ? 'id' : 'en';
}

/**
 * API request options
 */
interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  locale?: string;
}

async function executeRequest(
  url: string,
  fetchOptions: RequestInit,
  headers: Record<string, string>
): Promise<Response> {
  return fetch(url, {
    ...fetchOptions,
    headers: headers as HeadersInit,
  });
}

function buildUnauthorizedResponse<T>(code: string, message: string): ApiResponse<T> {
  return {
    success: false,
    error: {
      code,
      message,
      message_en: message,
    },
    timestamp: new Date().toISOString(),
    request_id: `req_${Date.now()}`,
  };
}

async function refreshAccessToken(baseUrl: string, basePath: string, locale: string): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const refreshPath = buildApiPath(basePath, REFRESH_ENDPOINT);
  const refreshUrl = `${baseUrl}${refreshPath}`;

  const response = await executeRequest(
    refreshUrl,
    {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
    {
      'Content-Type': 'application/json',
      'X-Locale': locale,
      'Accept-Language': locale,
    }
  );

  if (!response.ok) {
    return false;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return false;
  }

  const payload = (await response.json()) as ApiResponse<TokenData>;
  if (!payload.success || !payload.data) {
    return false;
  }

  tokenStorage.setAccessToken(payload.data.access_token, payload.data.expires_in);
  tokenStorage.setRefreshToken(payload.data.refresh_token);
  return true;
}

async function refreshAccessTokenSingleFlight(baseUrl: string, basePath: string, locale: string): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshed = await refreshAccessToken(baseUrl, basePath, locale);
        if (!refreshed) {
          tokenStorage.clear();
        }
        return refreshed;
      } catch {
        tokenStorage.clear();
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function isRefreshEndpoint(cleanEndpoint: string): boolean {
  return cleanEndpoint === REFRESH_ENDPOINT || cleanEndpoint.endsWith(`/${REFRESH_ENDPOINT}`);
}

/**
 * Make API request with standard error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const basePath = getApiBasePath();
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullPath = buildApiPath(basePath, cleanEndpoint);
  const url = `${baseUrl}${fullPath}`;
  
  const { requireAuth = false, locale, ...fetchOptions } = options;
  
  // Prepare headers
  const headers: Record<string, string> = {};
  
  // Only set Content-Type if body is not FormData (browser will set it automatically for FormData)
  const isFormData = fetchOptions.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Merge existing headers if provided
  if (fetchOptions.headers) {
    if (fetchOptions.headers instanceof Headers) {
      fetchOptions.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(fetchOptions.headers)) {
      fetchOptions.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, fetchOptions.headers);
    }
  }
  
  // Add locale header
  const currentLocale = locale || getCurrentLocale();
  headers['X-Locale'] = currentLocale;
  headers['Accept-Language'] = currentLocale;
  
  // Add authorization header if required (default to true for most API calls)
  if (requireAuth !== false) {
    if (tokenStorage.isTokenExpired()) {
      const refreshed = await refreshAccessTokenSingleFlight(baseUrl, basePath, currentLocale);
      if (!refreshed) {
        return buildUnauthorizedResponse<T>('TOKEN_EXPIRED', 'Session expired, please login again');
      }
    }

    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      return buildUnauthorizedResponse<T>('TOKEN_MISSING', 'Authentication token is missing');
    }

    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  try {
    let response = await executeRequest(url, fetchOptions, headers);

    if (response.status === 401 && requireAuth !== false && !isRefreshEndpoint(cleanEndpoint)) {
      const refreshed = await refreshAccessTokenSingleFlight(baseUrl, basePath, currentLocale);
      if (!refreshed) {
        return buildUnauthorizedResponse<T>('TOKEN_EXPIRED', 'Session expired, please login again');
      }

      const refreshedAccessToken = tokenStorage.getAccessToken();
      if (!refreshedAccessToken) {
        return buildUnauthorizedResponse<T>('TOKEN_MISSING', 'Authentication token is missing');
      }

      headers['Authorization'] = `Bearer ${refreshedAccessToken}`;
      response = await executeRequest(url, fetchOptions, headers);
    }

    const requestId = response.headers.get('x-request-id') || `req_${Date.now()}`;

    // Some endpoints (e.g. void actions) intentionally return 204 with no response body.
    if (response.status === 204) {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        request_id: requestId,
      };
    }
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    let data: ApiResponse<T>;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json() as ApiResponse<T>;
      // Handle non-2xx status codes
      if (!response.ok) {
        // If response has error structure, return it
        if (data.error) {
          return data;
        }

        // Otherwise, create a generic error response
        const error: ApiError = {
          code: `HTTP_${response.status}`,
          message: response.statusText || 'An error occurred',
          message_en: response.statusText || 'An error occurred',
        };

        return {
          success: false,
          error,
          timestamp: new Date().toISOString(),
          request_id: requestId,
        };
      }

      return data;
    }

    // For successful non-JSON responses, treat as success (empty data payload).
    if (response.ok) {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        request_id: requestId,
      };
    } else {
      // If response is not JSON, create error response
      const text = await response.text();
      const error: ApiError = {
        code: `HTTP_${response.status}`,
        message: text || response.statusText || 'An error occurred',
        message_en: text || response.statusText || 'An error occurred',
      };
      
      return {
        success: false,
        error,
        timestamp: new Date().toISOString(),
        request_id: requestId,
      };
    }
  } catch (error) {
    // Handle network errors
    const apiError: ApiError = {
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network error occurred',
      message_en: error instanceof Error ? error.message : 'Network error occurred',
    };
    
    return {
      success: false,
      error: apiError,
      timestamp: new Date().toISOString(),
      request_id: `req_${Date.now()}`,
    };
  }
}

/**
 * Login API call
 */
export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponseData>(
    'auth/login',
    {
      method: 'POST',
      body: JSON.stringify(credentials),
      requireAuth: false,
    }
  );
  
  // If login successful, store tokens
  if (response.success && response.data) {
    const { user, access_token, refresh_token, expires_in, token_type } = response.data;
    tokenStorage.setTokens(
      { access_token, refresh_token, expires_in, token_type },
      user,
      response.meta?.tenant_id
    );
  }
  
  return response as LoginResponse;
}

/**
 * Logout - clear tokens
 */
export function logout(): void {
  tokenStorage.clear();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = tokenStorage.getAccessToken();
  if (!token) return false;
  
  // Check if token is expired
  if (tokenStorage.isTokenExpired()) {
    tokenStorage.clear();
    return false;
  }
  
  return true;
}

/**
 * Get current user from storage
 */
export function getCurrentUser() {
  return tokenStorage.getUser();
}

/**
 * Get access token for API calls
 */
export function getAccessToken(): string | null {
  return tokenStorage.getAccessToken();
}

// Export apiRequest and utilities for future use
export { apiRequest, getApiBaseUrl, getApiBasePath };

