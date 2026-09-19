export const BOT_SHAPES = [
  'circle',
  'blob',
  'squircle',
  'tablet',
  'triangle',
  'hex',
  'cloud',
  'teardrop',
] as const

export type BotShape = (typeof BOT_SHAPES)[number]

/** Eleven swatches from the Grok Bot avatar panel. */
export const BOT_COLOR_IDS = [
  'ink',
  'brown',
  'red',
  'orange',
  'amber',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
  'gray',
] as const

export type BotColorId = (typeof BOT_COLOR_IDS)[number]

export const BOT_COLORS: Record<BotColorId, string> = {
  ink: '#0a0a0c',
  brown: '#8b5e3c',
  red: '#e8483f',
  orange: '#f08a24',
  amber: '#f0b429',
  green: '#3ecf8e',
  teal: '#2fbfa0',
  blue: '#3b93f0',
  purple: '#8b5cf6',
  pink: '#e152b0',
  gray: '#a3a3a3',
}

export const BOT_EXPRESSIONS = ['idle', 'talk', 'think', 'oops'] as const

export type BotExpression = (typeof BOT_EXPRESSIONS)[number]

export type BotKind = 'bot' | 'portrait'

/** Gaze in bot space: x right, y down, roughly -1…1. */
export type BotGaze = {
  x: number
  y: number
}

export type GrokCharacter = {
  id: string
  name: string
  kind: BotKind
  shape: BotShape
  color: BotColorId
  size: number
  gaze: BotGaze
  expression: BotExpression
  portraitSrc?: string
}

const DEFAULT_GAZE: BotGaze = { x: 0.32, y: -0.28 }
const DEFAULT_SIZE = 112

export function createBot(partial: Partial<GrokCharacter> = {}): GrokCharacter {
  return {
    id: 'bot',
    name: 'Bot',
    shape: 'circle',
    color: 'ink',
    size: DEFAULT_SIZE,
    gaze: DEFAULT_GAZE,
    expression: 'idle',
    ...partial,
    kind: 'bot',
  }
}

export function createPortrait(
  partial: Partial<GrokCharacter> = {}
): GrokCharacter {
  return {
    id: 'tamas',
    name: 'Tamas',
    shape: 'circle',
    color: 'ink',
    size: DEFAULT_SIZE,
    gaze: { x: 0.12, y: -0.08 },
    expression: 'idle',
    ...partial,
    kind: 'portrait',
  }
}

export function createPrePortfolioCast(): GrokCharacter[] {
  return [
    createBot({
      id: 'storyteller',
      name: 'Storyteller',
      shape: 'cloud',
      color: 'purple',
    }),
    createBot({
      id: 'engineer',
      name: 'Engineer',
      shape: 'hex',
      color: 'green',
    }),
    createBot({
      id: 'pm',
      name: 'Project manager',
      shape: 'tablet',
      color: 'brown',
    }),
    createBot({
      id: 'designer',
      name: 'Designer',
      shape: 'teardrop',
      color: 'pink',
    }),
    createPortrait({ id: 'tamas', name: 'Tamas' }),
  ]
}

export function botColorHex(color: BotColorId): string {
  return BOT_COLORS[color]
}

const TAU = Math.PI * 2
const PROFILE_SAMPLES = 64
const BODY_SCALE = 38
const BODY_CX = 50
const BODY_CY = 50

const ANGLES = Array.from(
  { length: PROFILE_SAMPLES },
  (_, i) => (i / PROFILE_SAMPLES) * TAU
)
const COS = ANGLES.map(Math.cos)
const SIN = ANGLES.map(Math.sin)

function normalizeRadii(radii: number[], max = 1): number[] {
  const peak = Math.max(...radii)
  if (peak <= 0) return radii
  const k = max / peak
  return radii.map((radius) => radius * k)
}

function superellipseRadii(n: number): number[] {
  return ANGLES.map((_, i) => {
    const c = Math.abs(COS[i] ?? 0) ** n
    const s = Math.abs(SIN[i] ?? 0) ** n
    return (c + s) ** (-1 / n)
  })
}

function unionOfCirclesRadii(
  circles: Array<{ x: number; y: number; r: number }>
): number[] {
  return ANGLES.map((_, i) => {
    const dx = COS[i] ?? 0
    const dy = SIN[i] ?? 0
    let best = 0
    for (const circle of circles) {
      const b = dx * circle.x + dy * circle.y
      const disc = b * b - (circle.x ** 2 + circle.y ** 2 - circle.r ** 2)
      if (disc < 0) continue
      const t = b + Math.sqrt(disc)
      if (t > best) best = t
    }
    return best
  })
}

type Point = { x: number; y: number }

function hullOfCircles(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  steps = 72
): Point[] {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy) || 1e-6
  const base = Math.atan2(dy, dx)
  const spread = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / dist)))
  const pts: Point[] = []
  const half = steps / 2
  for (let i = 0; i <= half; i++) {
    const a = base + spread + ((TAU - 2 * spread) * i) / half
    pts.push({ x: x1 + Math.cos(a) * r1, y: y1 + Math.sin(a) * r1 })
  }
  for (let i = 0; i <= half; i++) {
    const a = base - spread + (2 * spread * i) / half
    pts.push({ x: x2 + Math.cos(a) * r2, y: y2 + Math.sin(a) * r2 })
  }
  return pts
}

function profileFromPolygon(poly: Point[], cx: number, cy: number): number[] {
  return ANGLES.map((_, k) => {
    const dx = COS[k] ?? 0
    const dy = SIN[k] ?? 0
    let best = 0
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]
      const b = poly[(i + 1) % poly.length]
      if (!a || !b) continue
      const ex = b.x - a.x
      const ey = b.y - a.y
      const den = dx * ey - dy * ex
      if (Math.abs(den) < 1e-9) continue
      const px = a.x - cx
      const py = a.y - cy
      const t = (px * ey - py * ex) / den
      const u = (px * dy - py * dx) / den
      if (t > best && u >= 0 && u <= 1) best = t
    }
    return best
  })
}

function roundedPolygon(verts: Point[], cornerRadius: number): Point[] {
  const n = verts.length
  const out: Point[] = []
  const arcSteps = 8
  const edgeNormal = (a: Point, b: Point) => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    return Math.atan2(-dx / len, dy / len)
  }
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n]
    const cur = verts[i]
    const next = verts[(i + 1) % n]
    if (!prev || !cur || !next) continue
    const a0 = edgeNormal(prev, cur)
    const a1 = edgeNormal(cur, next)
    let delta = a1 - a0
    while (delta > Math.PI) delta -= TAU
    while (delta < -Math.PI) delta += TAU
    for (let step = 0; step <= arcSteps; step++) {
      const a = a0 + (delta * step) / arcSteps
      out.push({
        x: cur.x + Math.cos(a) * cornerRadius,
        y: cur.y + Math.sin(a) * cornerRadius,
      })
    }
  }
  return out
}

function regularPolygonRadii(
  sides: number,
  radius: number,
  cornerRadius: number,
  rotationDeg: number
): number[] {
  const rot = (rotationDeg * Math.PI) / 180
  const verts = Array.from({ length: sides }, (_, i) => {
    const a = rot + (i / sides) * TAU
    return {
      x: Math.cos(a) * (radius - cornerRadius),
      y: Math.sin(a) * (radius - cornerRadius),
    }
  })
  return profileFromPolygon(roundedPolygon(verts, cornerRadius), 0, 0)
}

function radiiForShape(shape: BotShape): number[] {
  switch (shape) {
    case 'circle':
      return ANGLES.map(() => 1)
    case 'blob':
      return normalizeRadii(
        ANGLES.map(
          (a) =>
            1 + 0.075 * Math.cos(2 * a + 0.5) + 0.035 * Math.cos(3 * a + 2.1)
        ),
        1.02
      )
    case 'squircle':
      return normalizeRadii(superellipseRadii(4.2), 1.15)
    case 'tablet':
      return profileFromPolygon(
        hullOfCircles(-0.42, 0, 0.62, 0.42, 0, 0.62),
        0,
        0
      )
    case 'triangle':
      return regularPolygonRadii(3, 1.12, 0.34, -90)
    case 'hex':
      return regularPolygonRadii(6, 1.04, 0.26, 0)
    case 'cloud':
      return normalizeRadii(
        unionOfCirclesRadii([
          { x: -0.44, y: 0.2, r: 0.54 },
          { x: 0.46, y: 0.2, r: 0.5 },
          { x: 0.02, y: 0.3, r: 0.6 },
          { x: -0.24, y: -0.3, r: 0.48 },
          { x: 0.3, y: -0.24, r: 0.44 },
        ]),
        1.02
      )
    case 'teardrop':
      return normalizeRadii(
        profileFromPolygon(hullOfCircles(0, 0.28, 0.66, 0, -0.96, 0.05), 0, 0),
        1.04
      )
    default: {
      const _exhaustive: never = shape
      return _exhaustive
    }
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function closedPath(pts: Point[], tension = 1 / 6): string {
  const n = pts.length
  if (n < 3) return ''
  const first = pts[0]
  if (!first) return ''
  let d = `M${round2(first.x)} ${round2(first.y)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    if (!p0 || !p1 || !p2 || !p3) continue
    const c1x = p1.x + (p2.x - p0.x) * tension
    const c1y = p1.y + (p2.y - p0.y) * tension
    const c2x = p2.x - (p3.x - p1.x) * tension
    const c2y = p2.y - (p3.y - p1.y) * tension
    d += `C${round2(c1x)} ${round2(c1y)} ${round2(c2x)} ${round2(c2y)} ${round2(p2.x)} ${round2(p2.y)}`
  }
  return `${d}Z`
}

function pathFromRadii(radii: number[]): string {
  const pts = radii.map((radius, i) => ({
    x: BODY_CX + radius * (COS[i] ?? 0) * BODY_SCALE,
    y: BODY_CY + radius * (SIN[i] ?? 0) * BODY_SCALE,
  }))
  return closedPath(pts)
}

const BODY_PATHS = Object.fromEntries(
  BOT_SHAPES.map((shape) => [shape, pathFromRadii(radiiForShape(shape))])
) as Record<BotShape, string>

export function botBodyPath(shape: BotShape): string {
  return BODY_PATHS[shape]
}

export type EyeLayout = {
  tilt: number
  split: number
  width: number
  height: number
  open: number
  gaze: BotGaze
}

export function eyeLayoutFor(
  expression: BotExpression,
  gaze: BotGaze
): EyeLayout {
  switch (expression) {
    case 'idle':
      return {
        tilt: -13,
        split: 15.2,
        width: 8.4,
        height: 18.6,
        open: 1,
        gaze,
      }
    case 'talk':
      return {
        tilt: -11,
        split: 15.6,
        width: 9.2,
        height: 16.4,
        open: 1,
        gaze,
      }
    case 'think':
      return {
        tilt: -8,
        split: 14.4,
        width: 7.6,
        height: 20.4,
        open: 1,
        gaze: { x: gaze.x * 0.25, y: -0.72 },
      }
    case 'oops':
      return {
        tilt: 10,
        split: 16.8,
        width: 12.4,
        height: 11.2,
        open: 0.92,
        gaze: { x: 0.42, y: 0.28 },
      }
    default: {
      const _exhaustive: never = expression
      return _exhaustive
    }
  }
}

export { GrokBot, type GrokBotProps } from './grok-bot.tsx'
