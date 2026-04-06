"use client"

import * as React from "react"
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const languages = [
  { 
    code: 'id', 
    label: 'Indonesia',
    flag: '/icon/indonesia-flag.svg'
  },
  { 
    code: 'en', 
    label: 'English',
    flag: '/icon/english-flag.svg'
  },
]

export function LanguageSwitcher() {
  const params = useParams()
  // Get locale from URL params as source of truth
  const localeFromParams = params?.locale as string
  const localeFromHook = useLocale()
  const locale = localeFromParams || localeFromHook
  const router = useRouter()
  const pathname = usePathname()

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  const handleLanguageChange = (newLocale: string) => {
    // Prevent switching to the same locale
    if (newLocale === locale) {
      return
    }
    // Use push to ensure proper navigation and URL update
    router.push(pathname, { locale: newLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0 border">
          <Image 
            src={currentLanguage.flag} 
            alt={currentLanguage.label}
            width={20}
            height={20}
            className="rounded-sm"
          />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={locale === language.code ? 'bg-accent text-accent-foreground' : ''}
          >
            <Image 
              src={language.flag} 
              alt={language.label}
              width={20}
              height={20}
              className="mr-2 rounded-sm"
            />
            <span>{language.label}</span>
            {locale === language.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
