export const TIME_THEME_STORAGE_KEY = 'portfolio-time-theme'

/** Fired when the user changes time-of-day theme; ThemeSync listens to re-apply auto dark mode. */
export const TIME_THEME_CHANGE_EVENT = 'portfolio:time-theme-change'

export const TIME_THEMES = [
  { id: 'auto', label: 'Auto' },
  { id: 'dawn', label: 'Dawn' },
  { id: 'day', label: 'Day' },
  { id: 'golden-hour', label: 'Golden hour' },
  { id: 'dusk', label: 'Dusk' },
  { id: 'night', label: 'Night' },
] as const

export type TimeThemeId = (typeof TIME_THEMES)[number]['id']

const VALID_IDS = new Set<string>(TIME_THEMES.map((t) => t.id))

function coerceMode(raw: unknown): TimeThemeId {
  return typeof raw === 'string' && VALID_IDS.has(raw)
    ? (raw as TimeThemeId)
    : 'auto'
}

/** Validates a `dataset.theme` or URL-style id string. */
export function normalizeTimeThemeId(id: string | undefined): TimeThemeId {
  return coerceMode(id ?? 'auto')
}

export function parseStoredTimeTheme(json: string | null): TimeThemeId {
  if (!json) {
    return 'auto'
  }
  try {
    const o = JSON.parse(json) as { mode?: unknown }
    return coerceMode(o?.mode)
  } catch {
    return 'auto'
  }
}

/**
 * Persist and apply palette. Non-`auto` presets use `[data-theme]` CSS overrides only;
 * `auto` restores `light-dark()` + `.dark` from OS preference and ambient light.
 */
export function applyTimeTheme(mode: TimeThemeId) {
  if (typeof document === 'undefined') {
    return
  }
  const el = document.documentElement
  el.dataset.theme = mode

  try {
    localStorage.setItem(TIME_THEME_STORAGE_KEY, JSON.stringify({ mode }))
  } catch {
    /* private mode / disabled storage */
  }

  if (mode === 'auto') {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      el.classList.toggle('dark', mq.matches)
    } catch {
      el.classList.remove('dark')
    }
  } else {
    el.classList.remove('dark')
  }

  window.dispatchEvent(new CustomEvent(TIME_THEME_CHANGE_EVENT))
}
