"use client"

import { Save } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function GeneralSettings() {
  const t = useTranslations('settings.generalSection')

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="business-name" className="text-sm font-medium">
            {t('businessName')}
          </Label>
          <Input id="business-name" defaultValue="GiPos Store" className="max-w-lg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t('email')}
          </Label>
          <Input id="email" type="email" defaultValue="admin@gipos.id" className="max-w-lg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            {t('phone')}
          </Label>
          <Input id="phone" defaultValue="+62 812 3456 7890" className="max-w-lg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            {t('address')}
          </Label>
          <Input id="address" defaultValue="Jl. Contoh No. 123, Jakarta" className="max-w-lg" />
        </div>
        <div className="pt-4">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            {t('saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  )
}

