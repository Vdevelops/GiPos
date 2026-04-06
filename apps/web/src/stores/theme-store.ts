import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode, ThemeVariant, ContrastMode } from '@/lib/theme'
import { applyTheme, getSystemTheme } from '@/lib/theme'

interface ThemeState {
  mode: ThemeMode
  variant: ThemeVariant
  contrast: ContrastMode
  mounted: boolean
  setMode: (mode: ThemeMode) => void
  setVariant: (variant: ThemeVariant) => void
  setContrast: (contrast: ContrastMode) => void
  getEffectiveTheme: () => 'light' | 'dark'
  initialize: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      variant: 'black',
      contrast: 'normal',
      mounted: false,

      setMode: (mode) => {
        set({ mode })
        const { variant, contrast } = get()
        applyTheme(mode, variant, contrast)
      },

      setVariant: (variant) => {
        set({ variant })
        const { mode, contrast } = get()
        applyTheme(mode, variant, contrast)
      },

      setContrast: (contrast) => {
        set({ contrast })
        const { mode, variant } = get()
        applyTheme(mode, variant, contrast)
      },

      getEffectiveTheme: () => {
        const { mode } = get()
        return mode === 'system' ? getSystemTheme() : mode
      },

      initialize: () => {
        const { mode, variant, contrast } = get()
        applyTheme(mode, variant, contrast)
        set({ mounted: true })
      },
    }),
    {
      name: 'gipos-theme-storage',
      partialize: (state) => ({
        mode: state.mode,
        variant: state.variant,
        contrast: state.contrast,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && globalThis.window !== undefined) {
          // Theme is already applied by blocking script, but ensure consistency
          // and update mounted state
          applyTheme(state.mode, state.variant, state.contrast)
          // Use the store's set function to properly update mounted state
          useThemeStore.setState({ mounted: true })
        }
      },
    }
  )
)

