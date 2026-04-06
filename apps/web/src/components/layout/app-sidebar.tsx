"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Wallet,
  UserCog,
  Store,
  Plug,
  Sparkles,
  Settings,
  HelpCircle,
  Search,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { UserProfileDropdown } from "./user-profile-dropdown"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const t = useTranslations()

  const navigation = [
    {
      title: t('nav.dashboard'),
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t('nav.pos'),
      url: "/pos",
      icon: ShoppingCart,
    },
    {
      title: t('nav.products'),
      url: "/products",
      icon: Package,
    },
    {
      title: t('nav.customers'),
      url: "/customers",
      icon: Users,
    },
    {
      title: t('nav.reports'),
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: t('nav.finance'),
      url: "/finance",
      icon: Wallet,
    },
    {
      title: t('nav.employees'),
      url: "/employees",
      icon: UserCog,
    },
    {
      title: t('nav.outlets'),
      url: "/outlets",
      icon: Store,
    },
    {
      title: t('nav.integrations'),
      url: "/integrations",
      icon: Plug,
    },
    {
      title: t('nav.premium'),
      url: "/premium",
      icon: Sparkles,
    },
  ]

  const secondaryNav = [
    {
      title: t('nav.settings'),
      url: "/settings",
      icon: Settings,
    },
    {
      title: t('nav.help'),
      url: "/help",
      icon: HelpCircle,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ShoppingCart className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">GiPos</span>
                  <span className="text-xs">Point of Sale</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50" />
            <Input
              placeholder={t('common.search')}
              className="h-8 pl-8 bg-background"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserProfileDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
