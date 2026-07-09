import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'
const KEY = 'gt-theme'

function current(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function subscribe(cb: () => void) {
  window.addEventListener('gt-theme-change', cb)
  return () => window.removeEventListener('gt-theme-change', cb)
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore storage errors */
  }
  window.dispatchEvent(new Event('gt-theme-change'))
}

export function toggleTheme() {
  setTheme(current() === 'dark' ? 'light' : 'dark')
}

/** Reactive current theme. Dark is the default (set by the boot script). */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, current, () => 'dark')
}
