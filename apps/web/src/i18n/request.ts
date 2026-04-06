import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale } from '@/features/dashboard/types';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // Load messages from all features and global messages
  const [
    globalMessages,
    dashboardMessages,
    landingMessages,
    authMessages,
    posMessages,
    productsMessages,
    customersMessages,
    reportsMessages,
    financeMessages,
    employeesMessages,
    outletsMessages,
    integrationsMessages,
    premiumMessages,
    settingsMessages,
    helpMessages,
  ] = await Promise.all([
    import(`@/i18n/messages/${locale}.json`),
    import(`@/features/dashboard/i18n/messages/${locale}.json`),
    import(`@/features/landing/i18n/messages/${locale}.json`),
    import(`@/features/auth/i18n/messages/${locale}.json`),
    import(`@/features/pos/i18n/messages/${locale}.json`),
    import(`@/features/products/i18n/messages/${locale}.json`),
    import(`@/features/customers/i18n/messages/${locale}.json`),
    import(`@/features/reports/i18n/messages/${locale}.json`),
    import(`@/features/finance/i18n/messages/${locale}.json`),
    import(`@/features/employees/i18n/messages/${locale}.json`),
    import(`@/features/outlets/i18n/messages/${locale}.json`),
    import(`@/features/integrations/i18n/messages/${locale}.json`),
    import(`@/features/premium/i18n/messages/${locale}.json`),
    import(`@/features/settings/i18n/messages/${locale}.json`),
    import(`@/features/help/i18n/messages/${locale}.json`),
  ]);

  // Deep merge function for nested objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deepMerge = (target: Record<string, any>, source: Record<string, any>): Record<string, any> => {
    const result = { ...target };
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  };

  // Merge all messages with deep merge for nested objects (global messages first, then features)
  let messages = { ...globalMessages.default };
  messages = deepMerge(messages, dashboardMessages.default);
  messages = deepMerge(messages, landingMessages.default);
  messages = deepMerge(messages, authMessages.default);
  messages = deepMerge(messages, posMessages.default);
  messages = deepMerge(messages, productsMessages.default);
  messages = deepMerge(messages, customersMessages.default);
  messages = deepMerge(messages, reportsMessages.default);
  messages = deepMerge(messages, financeMessages.default);
  messages = deepMerge(messages, employeesMessages.default);
  messages = deepMerge(messages, outletsMessages.default);
  messages = deepMerge(messages, integrationsMessages.default);
  messages = deepMerge(messages, premiumMessages.default);
  messages = deepMerge(messages, settingsMessages.default);
  messages = deepMerge(messages, helpMessages.default);

  return {
    locale,
    messages,
  };
});

