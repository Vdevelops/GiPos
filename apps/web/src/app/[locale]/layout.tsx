import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/features/dashboard/types';
import { Toaster } from '@/components/ui/sonner';
import { ReactQueryProvider } from '@/lib/react-query';

export const metadata: Metadata = {
  title: "GiPos - Point of Sale",
  description: "Platform POS SaaS untuk pasar Indonesia",
};

// Locale layout no longer has html/body tags to avoid nested tags
// Root layout now handles html/body with locale-specific attributes
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Get messages for the current locale - pass locale explicitly
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
      <ReactQueryProvider>
        {children}
        <Toaster />
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}

