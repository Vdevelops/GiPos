"use client"

import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { ThemeToggle } from "@/components/layout/theme-toggle"

interface PageHeaderProps {
  title: string
  breadcrumbItems?: Array<{ label: string; href?: string }>
}

export function PageHeader({ title, breadcrumbItems }: PageHeaderProps) {
  return (
    <header className="flex min-h-20 shrink-0 items-center gap-3 border-b border-border/70 px-4 py-3 md:px-6 print:hidden">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-1 data-[orientation=vertical]:h-5"
      />
      <div className="flex flex-1 flex-col gap-1">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems?.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator className="hidden md:flex" />}
                <BreadcrumbItem className={index > 0 ? "hidden md:inline-flex" : ""}>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  )
}

