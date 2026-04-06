import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { LoginRequest, ApiError } from '../types';
import { AuthService } from '../services/auth.service';
import { toast } from '@/lib/toast';

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

interface UseLoginReturn {
  login: (credentials: LoginRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

/**
 * Custom hook for login functionality
 * Handles login logic, error handling, and navigation
 */
export function useLogin(options?: UseLoginOptions): UseLoginReturn {
  const router = useRouter();
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.errors');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await AuthService.login(credentials);
      
      // Debug: log response
      console.log('Login response:', response);

      if (response.success && response.data) {
        // Login successful - tokens are already stored by AuthService.login()
        toast.success(t('loginSuccess'), t('redirecting'));
        options?.onSuccess?.();
        
        // Small delay to ensure cookie is set before redirect
        // This ensures middleware can read the cookie on the next request
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Immediate redirect using window.location for faster navigation
        // router.push can be slow due to client-side navigation
        if (globalThis.window !== undefined) {
          const currentLocale = globalThis.window.location.pathname.split('/')[1] || 'en';
          const dashboardPath = `/${currentLocale}/dashboard`;
          globalThis.window.location.href = dashboardPath;
          return; // Exit early to prevent further execution
        }
        
        // Fallback for server-side (shouldn't happen in this context)
        router.push('/dashboard');
      } else if (response.error) {
        // Handle API errors
        const apiError = response.error;
        const newFieldErrors: Record<string, string> = {};

        // Handle field-specific errors
        if (apiError.field_errors && apiError.field_errors.length > 0) {
          for (const fieldError of apiError.field_errors) {
            const errorMessage = fieldError.message || fieldError.message_en || tErrors('somethingWentWrong');
            newFieldErrors[fieldError.field] = errorMessage;
          }
          setFieldErrors(newFieldErrors);
        }

        // Handle general error
        let errorMessage = apiError.message || apiError.message_en || tErrors('somethingWentWrong');

        // Map common error codes to translation keys
        if (apiError.code === 'INVALID_CREDENTIALS' || apiError.code === 'UNAUTHORIZED') {
          errorMessage = tErrors('invalidCredentials');
        } else if (apiError.code === 'VALIDATION_ERROR' && Object.keys(newFieldErrors).length > 0) {
          // If we have field errors, don't show general error
          errorMessage = '';
        }

        if (errorMessage) {
          setError(errorMessage);
          // Show toast for general errors
          toast.error(errorMessage);
        } else if (Object.keys(newFieldErrors).length > 0) {
          // Show toast for validation errors
          toast.error(tErrors('validationError') || 'Terdapat kesalahan pada form', Object.values(newFieldErrors)[0]);
        }

        options?.onError?.(apiError);
      } else {
        // Unexpected response format
        const errorMessage = tErrors('somethingWentWrong');
        setError(errorMessage);
        toast.error(errorMessage);
        options?.onError?.({
          code: 'UNKNOWN_ERROR',
          message: errorMessage,
          message_en: errorMessage,
        });
      }
    } catch (err) {
      // Handle network errors or unexpected errors
      console.error('Login error:', err);
      const errorMessage = tErrors('somethingWentWrong');
      setError(errorMessage);
      toast.error(
        tErrors('networkError') || 'Kesalahan jaringan',
        errorMessage
      );
      options?.onError?.({
        code: 'NETWORK_ERROR',
        message: errorMessage,
        message_en: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
    fieldErrors,
  };
}

