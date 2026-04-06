import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { RegisterForm } from "@/features/auth/components/register-form"

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params
  const messages = await getMessages({ locale })
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <RegisterForm />
    </NextIntlClientProvider>
  )
}

