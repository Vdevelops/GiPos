import { toast as sonnerToast } from 'sonner';

/**
 * Toast helper functions using Sonner
 * Provides consistent toast notifications across the app
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 7000, // Errors stay longer
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show loading toast
   */
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  /**
   * Dismiss toast by ID
   */
  dismiss: (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

