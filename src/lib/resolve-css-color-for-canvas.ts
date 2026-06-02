/**
 * Browsers often return `oklch()`, `lab()`, etc. from `getComputedStyle`.
 * Canvas 2D `fillStyle` still expects `rgb()` / `rgba()` in many cases — resolve via the DOM.
 */
export function resolveCssColorForCanvas(cssColor: string): string {
  if (typeof document === 'undefined') return '#171717'
  if (
    cssColor.startsWith('rgb(') ||
    cssColor.startsWith('rgba(') ||
    cssColor.startsWith('#')
  ) {
    return cssColor
  }
  const el = document.createElement('span')
  el.style.color = cssColor
  el.style.position = 'fixed'
  el.style.left = '-9999px'
  el.style.pointerEvents = 'none'
  el.style.visibility = 'hidden'
  document.documentElement.appendChild(el)
  const resolved = getComputedStyle(el).color
  el.remove()
  return resolved || '#171717'
}

export function parseRgbChannels(cssColor: string): [number, number, number] {
  const resolved = resolveCssColorForCanvas(cssColor)
  const match = resolved.match(
    /rgba?\(\s*([\d.]+)\s*[,\s]+\s*([\d.]+)\s*[,\s]+\s*([\d.]+)/
  )
  if (!match) return [23 / 255, 23 / 255, 23 / 255]
  const r = Math.min(255, Math.max(0, Number.parseFloat(match[1] || '0')))
  const g = Math.min(255, Math.max(0, Number.parseFloat(match[2] || '0')))
  const b = Math.min(255, Math.max(0, Number.parseFloat(match[3] || '0')))
  return [r / 255, g / 255, b / 255]
}
