"use client"

import { useTranslations } from 'next-intl'
import { Check } from "lucide-react"
import Image from "next/image"

export function LandingFeatures() {
  const t = useTranslations('landing.features')
  
  const featureList = [
    t('feature1'),
    t('feature2'),
    t('feature3'),
    t('feature4'),
    t('feature5'),
    t('feature6'),
    t('feature7'),
    t('feature8'),
    t('feature9'),
    t('feature10'),
    t('feature11'),
    t('feature12'),
  ]
  
  return (
    <section id="features" className="flex min-h-screen items-center justify-center bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t('heading')}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('body')}
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center mb-12">
            <div className="relative aspect-video rounded-lg overflow-hidden border shadow-lg">
              <Image 
                src="/login.webp" 
                alt="GiPos Dashboard Preview" 
                fill
                className="object-cover"
              />
            </div>
            <div className="grid gap-4">
              {featureList.slice(0, 6).map((feature) => (
                <div key={feature} className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureList.slice(6).map((feature) => (
              <div key={feature} className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors">
                <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-base">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

