"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Full Image (2/3) */}
      <div className="hidden lg:block lg:w-2/3 p-6">
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/login.webp"
            alt="GiPos POS System"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Side - Form (1/3) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="bg-primary text-primary-foreground flex aspect-square size-10 items-center justify-center rounded-xl shadow-lg">
              <ShoppingCart className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-xl">GiPos</span>
              <span className="text-xs text-muted-foreground">Point of Sale</span>
            </div>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  )
}
