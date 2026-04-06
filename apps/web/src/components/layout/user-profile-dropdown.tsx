"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import {
  User,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthService } from "@/features/auth/services/auth.service"
import { toast } from "sonner"

interface UserProfileDropdownProps {
  user?: {
    name?: string
    email?: string
    avatar_url?: string
  }
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const t = useTranslations()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<{
    name?: string
    email?: string
    avatar_url?: string
  }>({
    name: "User",
    email: "user@example.com",
  })

  // Load user data on client side only to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
    const userData = user || AuthService.getCurrentUser() || {
      name: "User",
      email: "user@example.com",
    }
    setCurrentUser(userData)
  }, [user])

  const handleLogout = () => {
    AuthService.logout()
    toast.success(t('auth.logout.success') || 'Logged out successfully')
    router.push('/login')
  }

  const initials = React.useMemo(() => {
    if (!mounted) return 'U'
    return currentUser.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }, [currentUser.name, mounted])

  // Show loading state during hydration to avoid mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-3 rounded-lg p-2 w-full">
        <Avatar className="size-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5 leading-none min-w-0 flex-1">
          <span className="font-semibold truncate">User</span>
          <span className="text-xs text-muted-foreground truncate">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent w-full text-left">
          <Avatar className="size-8">
            <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 leading-none min-w-0 flex-1">
            <span className="font-semibold truncate">{currentUser.name || 'User'}</span>
            <span className="text-xs text-muted-foreground truncate">{currentUser.email || ''}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {currentUser.email || ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('nav.profile') || 'Profile'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('nav.settings') || 'Settings'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings/billing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>{t('nav.billing') || 'Billing'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>{t('nav.help') || 'Help & Support'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth.logout.title') || 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


