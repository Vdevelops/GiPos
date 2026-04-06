"use client"

import { CreditCard } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function BillingSettings() {
  const t = useTranslations('settings.billingSection')

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Separator />

      <div className="space-y-6 max-w-lg">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('currentPlan')}</Label>
          <p className="text-lg font-semibold">Professional</p>
          <p className="text-sm text-muted-foreground">Rp 299.000/bulan</p>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('paymentMethod')}</Label>
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">**** **** **** 1234</span>
          </div>
        </div>
        <div className="pt-4">
          <Button variant="outline">
            {t('updatePaymentMethod')}
          </Button>
        </div>
      </div>
    </div>
  )
}

