"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'
import Link from "next/link"

export function LandingTestimonials() {
  const t = useTranslations('landing.testimonials')
  
  return (
    <section className="flex min-h-screen items-center justify-center bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('heading')}
          </h2>
          <div className="mt-8 space-y-4 text-lg text-muted-foreground">
            <p>{t('body1')}</p>
            <p>{t('body2')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

