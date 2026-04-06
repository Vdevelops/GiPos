import { LoginForm } from "@/features/auth/components/login-form"
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params
  const messages = await getMessages({ locale })
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LoginForm />
    </NextIntlClientProvider>
  )
}

