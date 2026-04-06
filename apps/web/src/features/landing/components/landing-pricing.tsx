"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from 'next-intl'
import { Check } from "lucide-react"
import Link from "next/link"

export function LandingPricing() {
  const t = useTranslations('landing.pricing')
  
  const plans = [
    {
      key: 'free',
      popular: false,
    },
    {
      key: 'basic',
      popular: false,
    },
    {
      key: 'pro',
      popular: true,
    },
    {
      key: 'business',
      popular: false,
    },
  ]
  
  return (
    <section id="pricing" className="flex min-h-screen items-center justify-center bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const planData = t.raw(plan.key) as {
              name: string
              price: string
              period: string
              description: string
              features: string[]
              cta: string
              popular?: string
            }
            const features = planData.features || []
            const isPopular = plan.popular
            
            return (
              <Card 
                key={plan.key} 
                className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {isPopular && planData.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {planData.popular}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{planData.name}</CardTitle>
                  <CardDescription>{planData.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {plan.key === 'free' ? planData.price : `Rp ${planData.price}`}
                    </span>
                    {planData.period && (
                      <span className="text-muted-foreground">/{planData.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className="w-full" 
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    <Link href="/register">
                      {planData.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

