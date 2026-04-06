"use client"

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { applyTheme } from '@/lib/theme'

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const mounted = useThemeStore((state) => state.mounted)
  const mode = useThemeStore((state) => state.mode)
  const initialize = useThemeStore((state) => state.initialize)

  useEffect(() => {
    // Initialize theme on mount
    if (!mounted) {
      initialize()
    }

    // Track mediaQuery outside conditional to ensure cleanup always runs
    let mediaQuery: MediaQueryList | null = null
    let handleChange: ((event: MediaQueryListEvent) => void) | null = null

    // Listen for system theme changes when mode is 'system'
    if (mode === 'system' && globalThis.window !== undefined) {
      mediaQuery = globalThis.window.matchMedia('(prefers-color-scheme: dark)')
      handleChange = () => {
        const { mode, variant, contrast } = useThemeStore.getState()
        if (mode === 'system') {
          applyTheme(mode, variant, contrast)
        }
      }

      mediaQuery.addEventListener('change', handleChange)
    }

    // Always return cleanup function to prevent memory leaks
    // This ensures cleanup runs even when mode changes from 'system' to another value
    return () => {
      if (mediaQuery && handleChange) {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [mounted, mode, initialize])

  return <>{children}</>
}

