'use client'

import { useEffect } from 'react'

import { TIME_THEME_CHANGE_EVENT } from '@/lib/time-theme'

const DARK_MEDIA = '(prefers-color-scheme: dark)'

/** Dim environments bias toward dark surfaces (similar to daylight-aware portfolios). */
const LUX_DIM_THRESHOLD = 12
/** Very bright conditions bias toward the light palette (e.g. direct sun). */
const LUX_BRIGHT_THRESHOLD = 380

function prefersDarkOs(): boolean {
  return window.matchMedia(DARK_MEDIA).matches
}

function applyHtmlDark(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

function isAutoTimeTheme(): boolean {
  const theme = document.documentElement.dataset.theme
  return theme === '' || theme === undefined || theme === 'auto'
}

function resolveThemeDark(osDark: boolean, lux: number | null): boolean {
  if (typeof lux === 'number' && Number.isFinite(lux)) {
    if (lux < LUX_DIM_THRESHOLD) return true
    if (lux > LUX_BRIGHT_THRESHOLD) return false
  }
  return osDark
}

export function ThemeSync() {
  useEffect(() => {
    let lastLux: number | null = null
    let sensor: AmbientSensor | null = null

    const apply = () => {
      if (!isAutoTimeTheme()) {
        applyHtmlDark(false)
        return
      }
      applyHtmlDark(resolveThemeDark(prefersDarkOs(), lastLux))
    }

    const mq = window.matchMedia(DARK_MEDIA)
    const onMqChange = () => apply()
    mq.addEventListener('change', onMqChange)

    const onTimeThemePreference = () => apply()
    window.addEventListener(TIME_THEME_CHANGE_EVENT, onTimeThemePreference)

    apply()

    const bootSensor = async () => {
      const Ctor = (
        window as Window & { AmbientLightSensor?: new () => AmbientSensor }
      ).AmbientLightSensor
      if (typeof Ctor !== 'function' || !window.isSecureContext) {
        return
      }

      sensor = new Ctor()
      const bump = () => {
        const illuminance =
          typeof sensor?.illuminance === 'number' ? sensor.illuminance : null
        lastLux = illuminance
        apply()
      }

      if (sensor.addEventListener !== undefined) {
        sensor.addEventListener('reading', bump)
      } else {
        sensor.onreading = bump
      }

      try {
        await sensor.start?.()
      } catch {
        try {
          sensor.stop?.()
        } catch {
          /* noop */
        }
        sensor = null
        apply()
      }
    }

    void bootSensor()

    return () => {
      mq.removeEventListener('change', onMqChange)
      window.removeEventListener(TIME_THEME_CHANGE_EVENT, onTimeThemePreference)
      try {
        sensor?.stop?.()
      } catch {
        /* noop */
      }
    }
  }, [])

  return null
}

type AmbientSensor = EventTarget & {
  illuminance: number | null
  reading?: unknown
  onreading: ((this: AmbientSensor, ev: Event) => unknown) | null
  start: () => Promise<void>
  stop: () => void
  addEventListener?: typeof EventTarget.prototype.addEventListener
}
