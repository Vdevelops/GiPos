"use client"

import { Shield, CreditCard, Palette, Bell, Settings } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "./general-settings"
import { AppearanceSettings } from "./appearance-settings"
import { NotificationsSettings } from "./notifications-settings"
import { SecuritySettings } from "./security-settings"
import { BillingSettings } from "./billing-settings"

export function SettingsPage() {
  const t = useTranslations('settings')
  const tAppearance = useTranslations('settings.appearance')

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-base text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start border-b">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4" />
            {t('general')}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4" />
            {tAppearance('title')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4" />
            {t('notifications')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4" />
            {t('security')}
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4" />
            {t('billing')}
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="general" className="mt-0">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationsSettings />
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="billing" className="mt-0">
            <BillingSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
