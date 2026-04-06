import type { routing } from '@/i18n/routing';

type Locale = (typeof routing)['locales'][number];

declare global {
  interface IntlMessages {
    common: {
      dashboard: string;
      pos: string;
      products: string;
      customers: string;
      reports: string;
      finance: string;
      employees: string;
      outlets: string;
      integrations: string;
      premium: string;
      settings: string;
      help: string;
      overview: string;
      search: string;
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      add: string;
      back: string;
      next: string;
      previous: string;
      loading: string;
      error: string;
      success: string;
      confirm: string;
      close: string;
    };
    nav: {
      dashboard: string;
      pos: string;
      products: string;
      customers: string;
      reports: string;
      finance: string;
      employees: string;
      outlets: string;
      integrations: string;
      premium: string;
      settings: string;
      help: string;
    };
    dashboard: {
      title: string;
      overview: string;
      totalSales: string;
      totalOrders: string;
      totalCustomers: string;
      totalProducts: string;
    };
    settings: {
      title: string;
      description: string;
      general: string;
      account: string;
      notifications: string;
      security: string;
      billing: string;
      language: string;
      generalSection: {
        title: string;
        description: string;
        businessName: string;
        email: string;
        phone: string;
        address: string;
        saveChanges: string;
      };
      notificationsSection: {
        title: string;
        description: string;
        emailNotifications: string;
        emailNotificationsDesc: string;
        pushNotifications: string;
        pushNotificationsDesc: string;
        lowStockAlerts: string;
        lowStockAlertsDesc: string;
        salesReports: string;
        salesReportsDesc: string;
      };
      securitySection: {
        title: string;
        description: string;
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
        updatePassword: string;
      };
      billingSection: {
        title: string;
        description: string;
        currentPlan: string;
        paymentMethod: string;
        updatePaymentMethod: string;
      };
      appearance: {
        title: string;
        theme: {
          title: string;
          description: string;
          mode: {
            title: string;
            description: string;
            system: string;
            light: string;
            dark: string;
          };
          variant: {
            title: string;
            description: string;
            candy: string;
            blue: string;
            sand: string;
            black: string;
          };
          contrast: {
            title: string;
            description: string;
            high: string;
            descriptionHigh: string;
          };
        };
      };
    };
  }
}

export type { Locale };

