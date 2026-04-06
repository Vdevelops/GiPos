"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export function LandingHero() {
  const t = useTranslations('landing.hero')
  
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/20 pt-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t('headline')}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            {t('subtext')}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/register">
                {t('ctaPrimary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="#demo">
                <Play className="mr-2 h-4 w-4" />
                {t('ctaSecondary')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

