export type ThemeMode = 'system' | 'light' | 'dark'
export type ThemeVariant = 'candy' | 'blue' | 'sand' | 'black' | 'green'
export type ContrastMode = 'normal' | 'high'

const THEME_MODE_KEY = 'gipos_theme_mode'
const THEME_VARIANT_KEY = 'gipos_theme_variant'
const THEME_CONTRAST_KEY = 'gipos_theme_contrast'

/**
 * Theme storage utility for managing theme preferences
 * Uses localStorage for client-side persistence
 */
export const themeStorage = {
  /**
   * Get theme mode from localStorage
   */
  getMode(): ThemeMode {
    if (typeof globalThis.window === 'undefined') return 'system'
    const stored = globalThis.window.localStorage.getItem(THEME_MODE_KEY)
    return (stored as ThemeMode) || 'system'
  },

  /**
   * Set theme mode to localStorage
   */
  setMode(mode: ThemeMode): void {
    if (typeof globalThis.window === 'undefined') return
    globalThis.window.localStorage.setItem(THEME_MODE_KEY, mode)
  },

  /**
   * Get theme variant from localStorage
   */
  getVariant(): ThemeVariant {
    if (typeof globalThis.window === 'undefined') return 'candy'
    const stored = globalThis.window.localStorage.getItem(THEME_VARIANT_KEY)
    return (stored as ThemeVariant) || 'candy'
  },

  /**
   * Set theme variant to localStorage
   */
  setVariant(variant: ThemeVariant): void {
    if (typeof globalThis.window === 'undefined') return
    globalThis.window.localStorage.setItem(THEME_VARIANT_KEY, variant)
  },

  /**
   * Get contrast mode from localStorage
   */
  getContrast(): ContrastMode {
    if (typeof globalThis.window === 'undefined') return 'normal'
    const stored = globalThis.window.localStorage.getItem(THEME_CONTRAST_KEY)
    return (stored as ContrastMode) || 'normal'
  },

  /**
   * Set contrast mode to localStorage
   */
  setContrast(contrast: ContrastMode): void {
    if (typeof globalThis.window === 'undefined') return
    globalThis.window.localStorage.setItem(THEME_CONTRAST_KEY, contrast)
  },
}

/**
 * Get system preference for dark mode
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof globalThis.window === 'undefined') return 'light'
  return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Apply theme to HTML element
 * All theme CSS files are already imported in globals.css
 * We just need to set the data-theme attribute and dark/light class
 */
export function applyTheme(
  mode: ThemeMode,
  variant: ThemeVariant,
  contrast: ContrastMode = 'normal'
): void {
  if (typeof globalThis.document === 'undefined') return

  const html = globalThis.document.documentElement

  // Remove existing theme classes
  html.classList.remove('dark', 'light', 'high-contrast')
  html.removeAttribute('data-theme')

  // Set theme variant (all CSS files are already loaded via globals.css)
  html.setAttribute('data-theme', variant)

  // Determine actual theme (light or dark)
  let actualTheme: 'light' | 'dark'
  if (mode === 'system') {
    actualTheme = getSystemTheme()
  } else {
    actualTheme = mode
  }

  // Apply theme class
  if (actualTheme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.add('light')
  }

  // Apply contrast mode
  if (contrast === 'high') {
    html.classList.add('high-contrast')
  }
}

/**
 * Initialize theme on page load
 */
export function initTheme(): void {
  const mode = themeStorage.getMode()
  const variant = themeStorage.getVariant()
  const contrast = themeStorage.getContrast()
  
  applyTheme(mode, variant, contrast)

  // Listen for system theme changes
  if (typeof globalThis.window !== 'undefined' && mode === 'system') {
    const mediaQuery = globalThis.window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyTheme(mode, variant, contrast)
    }
    mediaQuery.addEventListener('change', handleChange)
  }
}

