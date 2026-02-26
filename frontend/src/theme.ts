export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'library_theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
  return 'light'
}

export function getResolvedTheme(): 'light' | 'dark' {
  const stored = getStoredTheme()
  if (stored === 'dark') return 'dark'
  if (stored === 'light') return 'light'
  return getSystemTheme()
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme: Theme): void {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  const root = document.documentElement
  root.setAttribute('data-theme', resolved)
}

export function initTheme(): void {
  const theme = getStoredTheme()
  applyTheme(theme)
  if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      applyTheme('system')
    })
  }
}
