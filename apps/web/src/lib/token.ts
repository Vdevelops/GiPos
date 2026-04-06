import type { TokenData, User } from '@/features/auth/types';

const ACCESS_TOKEN_KEY = 'gipos_access_token';
const REFRESH_TOKEN_KEY = 'gipos_refresh_token';
const USER_KEY = 'gipos_user';
const TENANT_ID_KEY = 'gipos_tenant_id';
const TOKEN_EXPIRY_KEY = 'gipos_token_expiry';

/**
 * Token storage utility for managing authentication tokens
 * Uses localStorage for client-side access
 */
export const tokenStorage = {
  /**
   * Store access token and calculate expiry time
   * Also stores in cookie for server-side middleware access
   */
  setAccessToken(token: string, expiresIn: number): void {
    if (typeof globalThis.window === 'undefined') return;
    
    const expiryTime = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds
    globalThis.window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    globalThis.window.localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    // Also store in cookie for server-side middleware access
    // Cookie expires in same time as token (expiresIn seconds)
    // Use both max-age and expires for better compatibility
    const maxAge = expiresIn; // seconds
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    const isSecure = globalThis.window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    globalThis.window.document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; expires=${expiryDate.toUTCString()}; SameSite=Lax${secureFlag}`;
  },

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    if (typeof globalThis.window === 'undefined') return null;
    return globalThis.window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Store refresh token
   */
  setRefreshToken(token: string): void {
    if (typeof globalThis.window === 'undefined') return;
    globalThis.window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    if (typeof globalThis.window === 'undefined') return null;
    return globalThis.window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Store user data
   */
  setUser(user: User): void {
    if (typeof globalThis.window === 'undefined') return;
    globalThis.window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Get user data from storage
   */
  getUser(): User | null {
    if (typeof globalThis.window === 'undefined') return null;
    const userStr = globalThis.window.localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Store tenant ID
   */
  setTenantId(tenantId: string): void {
    if (typeof globalThis.window === 'undefined') return;
    globalThis.window.localStorage.setItem(TENANT_ID_KEY, tenantId);
  },

  /**
   * Get tenant ID from storage
   */
  getTenantId(): string | null {
    if (typeof globalThis.window === 'undefined') return null;
    return globalThis.window.localStorage.getItem(TENANT_ID_KEY);
  },

  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    if (typeof globalThis.window === 'undefined') return true;
    const expiryStr = globalThis.window.localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return true;
    const expiryTime = Number.parseInt(expiryStr, 10);
    return Date.now() >= expiryTime;
  },

  /**
   * Store all token data from login response
   */
  setTokens(data: TokenData, user: User, tenantId?: string): void {
    this.setAccessToken(data.access_token, data.expires_in);
    this.setRefreshToken(data.refresh_token);
    this.setUser(user);
    if (tenantId) {
      this.setTenantId(tenantId);
    }
  },

  /**
   * Clear all authentication data
   * Also clears cookies
   */
  clear(): void {
    if (typeof globalThis.window === 'undefined') return;
    globalThis.window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    globalThis.window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    globalThis.window.localStorage.removeItem(USER_KEY);
    globalThis.window.localStorage.removeItem(TENANT_ID_KEY);
    globalThis.window.localStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    // Clear cookies
    globalThis.window.document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    globalThis.window.document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

