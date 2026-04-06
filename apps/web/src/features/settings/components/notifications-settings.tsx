"use client"

import { useTranslations } from 'next-intl'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function NotificationsSettings() {
  const t = useTranslations('settings.notificationsSection')

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Separator />

      <div className="space-y-0">
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5 flex-1">
            <Label className="text-sm font-medium">{t('emailNotifications')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('emailNotificationsDesc')}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5 flex-1">
            <Label className="text-sm font-medium">{t('pushNotifications')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('pushNotificationsDesc')}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5 flex-1">
            <Label className="text-sm font-medium">{t('lowStockAlerts')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('lowStockAlertsDesc')}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5 flex-1">
            <Label className="text-sm font-medium">{t('salesReports')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('salesReportsDesc')}
            </p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  )
}

