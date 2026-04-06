"use client"

import { Button } from "@/components/ui/button"
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export function LandingHeader() {
  const t = useTranslations('landing.header')
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold text-primary">GiPos</Link>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="#features">{t('features')}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="#pricing">{t('pricing')}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/faq">{t('faq')}</Link>
            </Button>
            <ThemeToggle />
            <LanguageSwitcher />
            <Button asChild variant="outline">
              <Link href="/login">{t('login')}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t('startFree')}</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

