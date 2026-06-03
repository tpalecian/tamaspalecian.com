/**
 * Design token names for use in JS/TS (Motion, canvas, tests).
 * CSS is the source of truth — keep in sync with `src/styles/tokens/`.
 */
export const semanticColors = [
  'background',
  'foreground',
  'muted',
  'muted-foreground',
  'surface-elevated',
  'surface-sunken',
  'border',
  'border-subtle',
  'grid-line',
  'construction-stroke',
  'accent',
  'accent-foreground',
  'accent-muted',
  'ring',
  'destructive',
  'destructive-foreground',
  'success',
] as const

export type SemanticColor = (typeof semanticColors)[number]

/** Resolve a semantic color token to a computed CSS color string. */
export function getSemanticColor(name: SemanticColor, el?: Element): string {
  if (typeof window === 'undefined') {
    return ''
  }
  const target = el ?? document.documentElement
  return getComputedStyle(target).getPropertyValue(`--color-${name}`).trim()
}
