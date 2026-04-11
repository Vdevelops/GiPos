"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Search,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

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

type MenuKey =
  | "dashboard"
  | "pos"
  | "products"
  | "reports"

type MenuItem = {
  key: MenuKey
  url: string
  icon: LucideIcon
}

const PRIMARY_MENU_ITEMS: MenuItem[] = [
  { key: "dashboard", url: "/dashboard", icon: LayoutDashboard },
  { key: "pos", url: "/pos", icon: ShoppingCart },
  { key: "products", url: "/products", icon: Package },
  { key: "reports", url: "/reports", icon: BarChart3 },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const t = useTranslations()
  const navigation = React.useMemo(() => PRIMARY_MENU_ITEMS, [])

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
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-9 items-center justify-center rounded-xl shadow-xs">
                  <ShoppingCart className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold tracking-tight">GiPos CRM</span>
                  <span className="text-xs text-sidebar-foreground/70">Business Command Center</span>
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
              className="h-9 pl-8 bg-background/80"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                    tooltip={t(`nav.${item.key}`)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(`nav.${item.key}`)}</span>
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
