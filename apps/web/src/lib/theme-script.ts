/**
 * Blocking script to prevent FOUC (Flash of Unstyled Content)
 * This script runs synchronously before React hydrates to apply the theme immediately
 */
export const themeScript = `
(function() {
  try {
    // Get stored theme from Zustand persist storage
    const storageKey = 'gipos-theme-storage';
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) return;
    
    const parsed = JSON.parse(stored);
    const state = parsed.state;
    
    if (!state) return;
    
    const mode = state.mode || 'system';
    const variant = state.variant || 'black';
    const contrast = state.contrast || 'normal';
    
    const html = document.documentElement;
    
    // Remove existing theme classes
    html.classList.remove('dark', 'light', 'high-contrast');
    html.removeAttribute('data-theme');
    
    // Set theme variant
    html.setAttribute('data-theme', variant);
    
    // Determine actual theme (light or dark)
    let actualTheme = 'light';
    if (mode === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      actualTheme = mode;
    }
    
    // Apply theme class
    if (actualTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
    
    // Apply contrast mode
    if (contrast === 'high') {
      html.classList.add('high-contrast');
    }
  } catch (e) {
    // Silently fail if there's an error
  }
})();
`.trim();

