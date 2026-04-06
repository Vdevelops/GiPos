"use client"

import { Shield } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function SecuritySettings() {
  const t = useTranslations('settings.securitySection')

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
          <Label htmlFor="current-password" className="text-sm font-medium">
            {t('currentPassword')}
          </Label>
          <Input id="current-password" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-sm font-medium">
            {t('newPassword')}
          </Label>
          <Input id="new-password" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            {t('confirmPassword')}
          </Label>
          <Input id="confirm-password" type="password" />
        </div>
        <div className="pt-4">
          <Button>
            <Shield className="mr-2 h-4 w-4" />
            {t('updatePassword')}
          </Button>
        </div>
      </div>
    </div>
  )
}

