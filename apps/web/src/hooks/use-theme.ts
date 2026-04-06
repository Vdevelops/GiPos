"use client"

import { useThemeStore } from '@/stores/theme-store'

/**
 * Hook untuk mengakses theme state dari Zustand store
 * @deprecated Use useThemeStore directly instead
 */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode)
  const variant = useThemeStore((state) => state.variant)
  const contrast = useThemeStore((state) => state.contrast)
  const mounted = useThemeStore((state) => state.mounted)
  const setMode = useThemeStore((state) => state.setMode)
  const setVariant = useThemeStore((state) => state.setVariant)
  const setContrast = useThemeStore((state) => state.setContrast)
  const getEffectiveTheme = useThemeStore((state) => state.getEffectiveTheme)

  return {
    mode,
    variant,
    contrast,
    effectiveTheme: getEffectiveTheme(),
    setMode,
    setVariant,
    setContrast,
    mounted,
  }
}

