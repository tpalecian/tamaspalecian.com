'use client'

import { useSyncExternalStore } from 'react'

import {
  applyTimeTheme,
  normalizeTimeThemeId,
  TIME_THEME_CHANGE_EVENT,
  TIME_THEMES,
  type TimeThemeId,
} from '@/lib/time-theme'

function getSnapshot(): TimeThemeId {
  if (typeof document === 'undefined') {
    return 'auto'
  }
  return normalizeTimeThemeId(document.documentElement.dataset.theme)
}

function subscribe(cb: () => void) {
  window.addEventListener(TIME_THEME_CHANGE_EVENT, cb)
  return () => window.removeEventListener(TIME_THEME_CHANGE_EVENT, cb)
}

export function TimeThemeSelect() {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => 'auto')

  return (
    <label className="pointer-events-auto fixed bottom-4 left-4 z-50 flex cursor-pointer flex-col gap-1 font-medium text-muted text-xs uppercase tracking-wide">
      <span className="pointer-events-none pl-px">Appearance</span>
      <select
        suppressHydrationWarning
        value={value}
        aria-label="Time of day color theme"
        onChange={(event) => applyTimeTheme(event.target.value as TimeThemeId)}
        className={
          'max-w-[calc(100vw-2rem)] cursor-pointer truncate rounded-md border border-border-subtle bg-surface-elevated py-2 pr-10 pl-2.5 text-foreground text-sm normal-case tracking-normal accent-accent shadow-sm backdrop-blur-sm'
        }
      >
        {TIME_THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.id === 'auto' ? `${t.label} (system & ambient)` : t.label}
          </option>
        ))}
      </select>
    </label>
  )
}
