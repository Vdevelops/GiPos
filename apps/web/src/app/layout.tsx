import { JetBrains_Mono, Manrope } from "next/font/google";
import { getLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/features/dashboard/types';
import { ThemeProvider } from '@/components/theme-provider';
import { themeScript } from '@/lib/theme-script';
import Script from 'next/script';
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

// This root layout is required by Next.js App Router
// Next.js 16 requires html/body tags in root layout
// We get the locale from next-intl to set the lang attribute
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from next-intl, fallback to default if not available
  let locale: Locale;
  try {
    const localeValue = await getLocale();
    locale = routing.locales.includes(localeValue as Locale) 
      ? (localeValue as Locale) 
      : routing.defaultLocale;
  } catch {
    locale = routing.defaultLocale;
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
