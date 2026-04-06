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
  }
}

export type { Locale };

