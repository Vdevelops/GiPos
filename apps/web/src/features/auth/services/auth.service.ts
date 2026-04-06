import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
} from '../types';
import { apiRequest } from '@/lib/api';
import { tokenStorage } from '@/lib/token';

/**
 * Auth Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  /**
   * Login with email and password
   * Uses API base path from environment variable (default: /api/v1)
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
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
  static logout(): void {
    tokenStorage.clear();
  }

  /**
   * Get current user from storage
   */
  static getCurrentUser() {
    return tokenStorage.getUser();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = tokenStorage.getAccessToken();
    if (!token) return false;

    // Check if token is expired
    if (tokenStorage.isTokenExpired()) {
      tokenStorage.clear();
      return false;
    }

    return true;
  }
}

