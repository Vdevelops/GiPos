"use client"

import { useTranslations } from 'next-intl'
import { Check } from "lucide-react"

export function LandingWhy() {
  const t = useTranslations('landing.why')
  
  const reasons = [
    t('reason1'),
    t('reason2'),
    t('reason3'),
    t('reason4'),
    t('reason5'),
  ]
  
  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('heading')}
          </h2>
          <p className="mt-6 text-center text-lg text-muted-foreground">
            {t('body')}
          </p>
          <ul className="mt-12 space-y-4">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-lg">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

