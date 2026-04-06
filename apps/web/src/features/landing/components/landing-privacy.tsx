"use client"

import { useTranslations } from 'next-intl'

export function LandingPrivacy() {
  const t = useTranslations('landing.privacy')
  
  const sections = [
    { title: t('section1.title'), content: t('section1.content') },
    { title: t('section2.title'), content: t('section2.content') },
    { title: t('section3.title'), content: t('section3.content') },
    { title: t('section4.title'), content: t('section4.content') },
    { title: t('section5.title'), content: t('section5.content') },
    { title: t('section6.title'), content: t('section6.content') },
    { title: t('section7.title'), content: t('section7.content') },
    { title: t('section8.title'), content: t('section8.content') },
    { title: t('section9.title'), content: t('section9.content') },
    { title: t('section10.title'), content: t('section10.content') },
    { title: t('section11.title'), content: t('section11.content') },
  ]
  
  return (
    <section className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {t('heading')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('lastUpdated')}</p>
          </div>
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="prose prose-neutral dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
