import { LandingPage } from "@/features/landing/components/landing-page"
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
      <LandingPage />
    </NextIntlClientProvider>
  )
}
