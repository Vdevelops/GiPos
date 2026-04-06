"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function LandingCTA() {
  const t = useTranslations('landing.cta')
  
  return (
    <section className="flex min-h-screen items-center justify-center bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('heading')}
          </h2>
          <p className="mt-4 text-lg opacity-90">
            {t('subtext')}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/register">
                {t('ctaPrimary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="#demo">
                {t('ctaSecondary')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

