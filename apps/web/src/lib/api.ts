import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  ApiError,
} from '@/features/auth/types';
import { tokenStorage } from './token';

/**
 * Get API base URL from environment variable
 * Defaults to localhost:8080 for development
 */
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  }
  // Client-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
}

/**
 * Get API base path from environment variable
 * Defaults to /api/v1 for standard API versioning
 */
function getApiBasePath(): string {
  const basePath = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1';
  // Ensure it starts with / and doesn't end with /
  return basePath.startsWith('/') ? basePath : `/${basePath}`;
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

/**
 * Make API request with standard error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const basePath = getApiBasePath();
  
  // Remove leading slash from endpoint if present, then combine with basePath
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullPath = `${basePath}/${cleanEndpoint}`;
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
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: headers as HeadersInit,
    });
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    let data: ApiResponse<T>;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json() as ApiResponse<T>;
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
        request_id: `req_${Date.now()}`,
      };
    }
    
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
        request_id: `req_${Date.now()}`,
      };
    }
    
    return data;
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
    '/api/v1/auth/login',
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

