"use client"

import { Monitor, Sun, Moon, Check } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useThemeStore } from "@/stores/theme-store"
import { cn } from "@/lib/utils"

const themeVariants = [
  { id: 'candy', colors: ['#ca5a3e', '#f4d9c9', '#f3b06a', '#4e6fdb'], preview: '/theme-previews/candy.svg' },
  { id: 'blue', colors: ['#4d68d6', '#dfe6ff', '#6f9de2', '#3f6ec6'], preview: '/theme-previews/blue.svg' },
  { id: 'sand', colors: ['#d9a450', '#f5e6bf', '#d4c37d', '#6f8ed8'], preview: '/theme-previews/sand.svg' },
  { id: 'black', colors: ['#2f3f59', '#dde4f2', '#6d80a5', '#518f7b'], preview: '/theme-previews/black.svg' },
  { id: 'green', colors: ['#2f9a7d', '#d8efe8', '#6eb6a6', '#5f77d6'], preview: '/theme-previews/green.svg' },
] as const

export function ThemeSettings() {
  const t = useTranslations('settings.appearance.theme')
  const mode = useThemeStore((state) => state.mode)
  const variant = useThemeStore((state) => state.variant)
  const contrast = useThemeStore((state) => state.contrast)
  const mounted = useThemeStore((state) => state.mounted)
  const setMode = useThemeStore((state) => state.setMode)
  const setVariant = useThemeStore((state) => state.setVariant)
  const setContrast = useThemeStore((state) => state.setContrast)

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Separator />

      <div className="space-y-8">
        <div className="space-y-5">
          <div className="space-y-1">
            <Label className="text-sm font-medium">{t('mode.title')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('mode.description')}
            </p>
          </div>
          <RadioGroup 
            value={mode} 
            onValueChange={(value) => setMode(value as 'system' | 'light' | 'dark')}
            className="gap-4"
          >
            <RadioGroupItem value="system" className="flex-1">
              <Monitor className="mr-2 h-4 w-4" />
              {t('mode.system')}
            </RadioGroupItem>
            <RadioGroupItem value="light" className="flex-1">
              <Sun className="mr-2 h-4 w-4" />
              {t('mode.light')}
            </RadioGroupItem>
            <RadioGroupItem value="dark" className="flex-1">
              <Moon className="mr-2 h-4 w-4" />
              {t('mode.dark')}
            </RadioGroupItem>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-5">
          <div className="space-y-1">
            <Label className="text-sm font-medium">{t('variant.title')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('variant.description')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {themeVariants.map((theme) => {
              const isSelected = variant === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setVariant(theme.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-3 rounded-lg border p-4 transition-all",
                    "hover:border-primary/50 hover:bg-muted/30",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-transparent"
                  )}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex gap-1">
                      {theme.colors.map((color) => (
                        <div
                          key={color}
                          className="h-3.5 w-3.5 rounded-full border border-border/50"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{t(`variant.${theme.id}`)}</span>
                  </div>
                  <div className="h-12 w-full rounded-md border border-border/50 overflow-hidden bg-muted/30">
                    <img
                      src={theme.preview}
                      alt={`${theme.id} theme preview`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        <div className="space-y-5">
          <div className="space-y-1">
            <Label className="text-sm font-medium">{t('contrast.title')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('contrast.description')}
            </p>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="high-contrast" className="text-sm font-medium">
                {t('contrast.high')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('contrast.descriptionHigh')}
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={contrast === 'high'}
              onCheckedChange={(checked) => setContrast(checked ? 'high' : 'normal')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
