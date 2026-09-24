import { BOT_EYE_GLYPHS } from './bot-mark-eyes'
import type { BotMarkShape } from './grok-bot-app-types'

const CX = 114.2705
const TAU = Math.PI * 2

const SHAPE_WEIGHT: Record<BotMarkShape, number> = {
  blob: 0.92,
  pebble: 0.96,
  squircle: 0.84,
  tablet: 1,
  triangle: 0.94,
  hex: 0.94,
  cloud: 1,
  teardrop: 1,
}

const UNIT = 259 / 229
const ASPECTS = [1 / 1.45, 0.8, 1 / 1.12, 1, 1.12, 1.25, 1.45]

const BLOB_PATH =
  'M228.541 114.228C228.541 130.133 225.184 145.994 218.738 160.534C212.674 174.217 203.904 186.669 193.065 196.988C155.933 232.34 99.497 238.596 55.5255 212.24C45.097 205.99 35.6851 198.072 27.7451 188.866C19.1926 178.953 12.3686 167.569 7.65781 155.351C2.60712 142.264 0 128.257 0 114.228C0 98.3219 3.35751 82.4611 9.80315 67.9215C15.8672 54.2382 24.6377 41.7862 35.4767 31.4668C72.6081 -3.88483 129.044 -10.1413 173.016 16.2153C183.444 22.4653 192.856 30.3829 200.796 39.5896C209.349 49.5018 216.173 60.8859 220.883 73.1037C225.934 86.1906 228.541 100.198 228.541 114.228Z'

export const BOT_MARK_CENTER = CX

export const BOT_MARK_BANG_PATH =
  'M99.2705 81.2705A15 15 0 0 1 129.2705 81.2705L122.7705 153.7705A8.5 8.5 0 0 1 105.7705 153.7705Z'

export type BotEyeAnchor = {
  cx: number
  cy: number
  scale: number
}

export type BotMarkGeometry = {
  path: string
  scale: number
  eyes: readonly [BotEyeAnchor, BotEyeAnchor]
}

type Point = [number, number]
type Face = { x: number; y: number; sx: number; sy: number; eye: number }

class PathBuilder {
  d = ''

  move(x: number, y: number): this {
    this.d += `M${round(x)} ${round(y)}`
    return this
  }

  line(x: number, y: number): this {
    this.d += `L${round(x)} ${round(y)}`
    return this
  }

  curve(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number
  ): this {
    this.d += `C${round(x1)} ${round(y1)} ${round(x2)} ${round(y2)} ${round(x)} ${round(y)}`
    return this
  }

  corner(prev: Point, curr: Point, next: Point, radius: number): this {
    const dir = (from: Point, to: Point): Point => {
      const dx = from[0] - to[0]
      const dy = from[1] - to[1]
      const len = Math.hypot(dx, dy) || 1
      return [dx / len, dy / len]
    }
    const incoming = dir(prev, curr)
    const outgoing = dir(next, curr)
    const start: Point = [
      curr[0] + incoming[0] * radius,
      curr[1] + incoming[1] * radius,
    ]
    const end: Point = [
      curr[0] + outgoing[0] * radius,
      curr[1] + outgoing[1] * radius,
    ]
    if (this.d) this.line(start[0], start[1])
    else this.move(start[0], start[1])
    this.d += `Q${round(curr[0])} ${round(curr[1])} ${round(end[0])} ${round(end[1])}`
    return this
  }

  arc(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    start: number,
    end: number
  ): this {
    const steps = Math.max(1, Math.ceil(Math.abs(end - start) / (Math.PI / 2)))
    const delta = (end - start) / steps
    const handle = (4 / 3) * Math.tan(delta / 4)
    let angle = start
    for (let step = 0; step < steps; step++) {
      const next = angle + delta
      const from: Point = [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]
      const to: Point = [cx + rx * Math.cos(next), cy + ry * Math.sin(next)]
      this.curve(
        from[0] - handle * rx * Math.sin(angle),
        from[1] + handle * ry * Math.cos(angle),
        to[0] + handle * rx * Math.sin(next),
        to[1] - handle * ry * Math.cos(next),
        to[0],
        to[1]
      )
      angle = next
    }
    return this
  }

  close(): this {
    this.d += 'Z'
    return this
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function pointsPath(points: Point[]): string {
  return `M${points.map((point) => `${round(point[0])} ${round(point[1])}`).join('L')}Z`
}

function sample(fn: (angle: number) => Point, count = 128): Point[] {
  const points: Point[] = []
  for (let index = 0; index < count; index++) {
    points.push(fn((index / count) * TAU))
  }
  return points
}

function roundedPolygon(points: Point[], radius: number): string {
  const builder = new PathBuilder()
  const count = points.length
  for (let index = 0; index < count; index++) {
    const curr = points[index]
    const prev = points[(index - 1 + count) % count]
    const next = points[(index + 1) % count]
    if (!curr || !prev || !next) continue
    builder.corner(prev, curr, next, radius)
  }
  return builder.close().d
}

function regularPolygon(
  radius: number,
  sides: number,
  corner: number,
  rotation: number
): string {
  const points = Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index / sides) * TAU
    return [
      CX + Math.cos(angle) * radius,
      CX + Math.sin(angle) * radius,
    ] as Point
  })
  return roundedPolygon(points, corner)
}

function superellipse(rx: number, ry: number, n: number): string {
  return pointsPath(
    sample((angle) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return [
        CX + Math.sign(cos) * Math.abs(cos) ** (2 / n) * rx,
        CX + Math.sign(sin) * Math.abs(sin) ** (2 / n) * ry,
      ]
    })
  )
}

function unionOfCircles(
  circles: readonly (readonly [number, number, number])[]
): string {
  return pointsPath(
    sample((angle) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      let reach = 0
      for (const [cx, cy, radius] of circles) {
        const dx = cx - CX
        const dy = cy - CX
        const projection = cos * dx + sin * dy
        const hit =
          projection * projection - (dx * dx + dy * dy) + radius * radius
        if (hit <= 0) continue
        reach = Math.max(reach, projection + Math.sqrt(hit))
      }
      return [CX + cos * reach, CX + sin * reach]
    }, 160)
  )
}

function tabletPath(): string {
  const left = CX - 114 + 74
  return new PathBuilder()
    .move(left, 40.2705)
    .line(154.2705, 40.2705)
    .arc(154.2705, CX, 74, 74, -Math.PI / 2, Math.PI / 2)
    .line(left, 188.2705)
    .arc(left, CX, 74, 74, Math.PI / 2, (3 * Math.PI) / 2)
    .close().d
}

function teardropPath(): string {
  const tip = CX - 114
  const ratio = clamp(88 / (140.2705 - tip), -1, 1)
  const side = Math.sqrt(1 - ratio * ratio)
  const right: Point = [CX + 88 * side, 140.2705 - 88 * ratio]
  const left: Point = [CX - 88 * side, 140.2705 - 88 * ratio]
  const sweep = Math.atan2(right[1] - 140.2705, right[0] - CX)
  return new PathBuilder()
    .corner(right, [CX, tip], left, 18)
    .line(left[0], left[1])
    .arc(CX, 140.2705, 88, 88, Math.PI - sweep, sweep)
    .close().d
}

function samplePath(d: string): Point[] {
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []
  let index = 0
  const next = () => {
    const token = tokens[index]
    index += 1
    return Number(token)
  }
  const points: Point[] = []
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  const add = (fn: (u: number) => Point, length: number) => {
    const steps = Math.max(2, Math.ceil(length / 4))
    for (let step = 1; step <= steps; step++) points.push(fn(step / steps))
  }

  while (index < tokens.length) {
    const command = tokens[index]
    if (!command || !/[a-z]/i.test(command)) break
    index += 1
    if (command === 'M') {
      x = next()
      y = next()
      startX = x
      startY = y
      points.push([x, y])
    } else if (command === 'L') {
      const nx = next()
      const ny = next()
      const x0 = x
      const y0 = y
      add(
        (u) => [x0 + (nx - x0) * u, y0 + (ny - y0) * u],
        Math.hypot(nx - x0, ny - y0)
      )
      x = nx
      y = ny
    } else if (command === 'Q') {
      const x1 = next()
      const y1 = next()
      const nx = next()
      const ny = next()
      const x0 = x
      const y0 = y
      add(
        (u) => {
          const rest = 1 - u
          return [
            rest * rest * x0 + 2 * rest * u * x1 + u * u * nx,
            rest * rest * y0 + 2 * rest * u * y1 + u * u * ny,
          ]
        },
        Math.hypot(nx - x0, ny - y0)
      )
      x = nx
      y = ny
    } else if (command === 'C') {
      const x1 = next()
      const y1 = next()
      const x2 = next()
      const y2 = next()
      const nx = next()
      const ny = next()
      const x0 = x
      const y0 = y
      add(
        (u) => {
          const rest = 1 - u
          return [
            rest ** 3 * x0 +
              3 * rest * rest * u * x1 +
              3 * rest * u * u * x2 +
              u ** 3 * nx,
            rest ** 3 * y0 +
              3 * rest * rest * u * y1 +
              3 * rest * u * u * y2 +
              u ** 3 * ny,
          ]
        },
        Math.hypot(nx - x0, ny - y0)
      )
      x = nx
      y = ny
    } else if (command === 'Z') {
      if (Math.hypot(startX - x, startY - y) > 0.01) {
        const x0 = x
        const y0 = y
        add(
          (u) => [x0 + (startX - x0) * u, y0 + (startY - y0) * u],
          Math.hypot(startX - x0, startY - y0)
        )
      }
      x = startX
      y = startY
    } else {
      const unexpected: never = command as never
      throw new Error(`Unsupported path command ${String(unexpected)}`)
    }
  }

  return points
}

function normalizePath(d: string, points: Point[]): string {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const point of points) {
    minX = Math.min(minX, point[0])
    maxX = Math.max(maxX, point[0])
    minY = Math.min(minY, point[1])
    maxY = Math.max(maxY, point[1])
  }
  const fit = clamp(228.44 / Math.max(maxX - minX, maxY - minY), 0.9, 1.35)
  const dx = CX - (minX + maxX) / 2
  const dy = CX - (minY + maxY) / 2
  if (Math.abs(fit - 1) < 0.005 && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
    return d
  }
  let axis = 0
  return d.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (raw) => {
    axis ^= 1
    const value = Number(raw)
    const shifted = CX + (value + (axis ? dx : dy) - CX) * fit
    return String(round(shifted))
  })
}

function spanAt(points: Point[]): (y: number) => [number, number] {
  let top = Infinity
  let bottom = -Infinity
  for (const point of points) {
    top = Math.min(top, point[1])
    bottom = Math.max(bottom, point[1])
  }
  const bands = 160
  const span = bottom - top
  const left = new Float64Array(bands)
  const right = new Float64Array(bands)
  for (let band = 0; band < bands; band++) {
    const y = top + (span * (band + 0.5)) / bands
    let innerLeft = -Infinity
    let innerRight = Infinity
    for (let index = 0; index < points.length; index++) {
      const current = points[index]
      const next = points[(index + 1) % points.length]
      if (!current || !next || current[1] <= y === next[1] <= y) continue
      const x =
        current[0] +
        ((next[0] - current[0]) * (y - current[1])) / (next[1] - current[1])
      if (x <= CX) innerLeft = Math.max(innerLeft, x)
      else innerRight = Math.min(innerRight, x)
    }
    left[band] = Number.isFinite(innerLeft) ? innerLeft : CX
    right[band] = Number.isFinite(innerRight) ? innerRight : CX
  }
  return (y: number) => {
    const f = clamp(((y - top) / span) * bands - 0.5, 0, bands - 1)
    const band = Math.floor(f)
    const mix = f - band
    const next = Math.min(band + 1, bands - 1)
    const leftEdge = left[band] ?? CX
    const rightEdge = right[band] ?? CX
    const nextLeft = left[next] ?? leftEdge
    const nextRight = right[next] ?? rightEdge
    return [
      leftEdge + (nextLeft - leftEdge) * mix,
      rightEdge + (nextRight - rightEdge) * mix,
    ]
  }
}

function faceFit(points: Point[]): Face {
  const sparse: Point[] = []
  const stride = Math.max(1, Math.round(points.length / 110))
  for (let index = 0; index < points.length; index += stride) {
    const point = points[index]
    if (point) sparse.push(point)
  }
  let best = { score: -1, x: CX, y: CX, a: 1, b: 1 }
  const consider = (x: number, y: number, aspect: number) => {
    let nearest = Infinity
    for (const point of sparse) {
      const dx = point[0] - x
      const dy = (point[1] - y) * aspect
      nearest = Math.min(nearest, dx * dx + dy * dy)
    }
    const radius = Math.sqrt(nearest)
    const minor = radius / aspect
    const score =
      radius *
      minor *
      (1 - 0.0018 * Math.abs(y - CX) - 0.004 * Math.abs(x - CX))
    if (score > best.score) best = { score, x, y, a: radius, b: minor }
  }
  for (let y = 58.2705; y <= 170.2705; y += 8) {
    for (let x = 98.2705; x <= 130.2705; x += 8) {
      for (const aspect of ASPECTS) consider(x, y, aspect)
    }
  }
  for (let y = best.y - 8; y <= best.y + 8; y += 2) {
    for (let x = best.x - 8; x <= best.x + 8; x += 2) {
      for (const aspect of ASPECTS) consider(x, y, aspect)
    }
  }
  const sx = clamp(best.a / CX, 0.3, 1)
  const sy = clamp(best.b / CX, 0.3, 1)
  return {
    x: round(best.x - CX),
    y: round(best.y - CX),
    sx: round(sx),
    sy: round(sy),
    eye: round(
      clamp((0.7 * Math.min(sx, sy) + 0.3 * Math.max(sx, sy)) * 1.12, 0.64, 1)
    ),
  }
}

function boundsY(points: Point[]): { top: number; bottom: number } {
  let top = Infinity
  let bottom = -Infinity
  for (const point of points) {
    top = Math.min(top, point[1])
    bottom = Math.max(bottom, point[1])
  }
  return { top, bottom }
}

function placeEyes(
  points: Point[],
  face: Face,
  leftDX: number
): [BotEyeAnchor, BotEyeAnchor] {
  const glyph = BOT_EYE_GLYPHS[0]
  if (!glyph) throw new Error('Missing the resting eye glyph')
  const horizontal = spanAt(points)
  const { top, bottom } = boundsY(points)
  const half = glyph.map((eye) => {
    let width = 0
    for (const point of eye) width = Math.max(width, Math.abs(point[0]))
    return width
  })
  const restingCenters: Point[] = [
    [136.62, 66.73],
    [185.69, 57.21],
  ]
  const gap =
    Math.abs(
      (restingCenters[1]?.[0] ?? 0) - ((restingCenters[0]?.[0] ?? 0) + leftDX)
    ) * face.sx
  const cap =
    (half[0] ?? 0) + (half[1] ?? 0) > 0.5
      ? clamp((gap - 5) / ((half[0] ?? 1) + (half[1] ?? 1)), 0.35, 4)
      : 4
  const scale = Math.min(clamp(face.eye, 0.2, 2), cap)

  return glyph.map((eye, index) => {
    const origin = restingCenters[index] ?? [CX, CX]
    const originX = origin[0] + (index === 0 ? leftDX : 0)
    const localX = (originX - CX) * face.sx
    const py = clamp(
      CX + face.y + (origin[1] - CX) * face.sy,
      top + 2,
      bottom - 2
    )
    let leftLimit = -Infinity
    let rightLimit = Infinity
    for (let pointIndex = 0; pointIndex < eye.length; pointIndex += 2) {
      const point = eye[pointIndex]
      if (!point) continue
      const dx = point[0] * scale
      const [leftEdge, rightEdge] = horizontal(py + point[1] * scale)
      leftLimit = Math.max(leftLimit, leftEdge - dx)
      rightLimit = Math.min(rightLimit, rightEdge - dx)
    }
    const desired = CX + face.x + localX
    const cx =
      leftLimit <= rightLimit
        ? clamp(desired, leftLimit, rightLimit)
        : (leftLimit + rightLimit) / 2
    return { cx: round(cx), cy: round(py), scale: round(scale) }
  }) as [BotEyeAnchor, BotEyeAnchor]
}

function geometryFor(raw: string, shape: BotMarkShape): BotMarkGeometry {
  const normalized = normalizePath(raw, samplePath(raw))
  const points = samplePath(normalized)
  const face = faceFit(points)
  const leftDX = shape === 'triangle' ? -6 : 0
  return {
    path: normalized,
    scale: round(SHAPE_WEIGHT[shape] * UNIT),
    eyes: placeEyes(points, face, leftDX),
  }
}

function rawPath(shape: BotMarkShape): string {
  switch (shape) {
    case 'blob':
      return BLOB_PATH
    case 'pebble':
      return pointsPath(
        sample((angle) => {
          const radius =
            108 *
            (1 +
              0.075 *
                (0.6 * Math.sin(2 * angle + 1.1) +
                  0.4 * Math.sin(3 * angle - 1.1)))
          return [
            CX + Math.cos(angle) * radius,
            CX + Math.sin(angle) * radius * 0.98,
          ]
        })
      )
    case 'squircle':
      return superellipse(107, 107, 3.2)
    case 'tablet':
      return tabletPath()
    case 'triangle':
      return regularPolygon(130, 3, 60, -Math.PI / 2)
    case 'hex':
      return regularPolygon(114, 6, 20, Math.PI / 6)
    case 'cloud':
      return unionOfCircles([
        [52.2705, 140.2705, 56],
        [176.2705, 140.2705, 54],
        [CX, 148.2705, 62],
        [90.2705, 84.2705, 62],
        [152.2705, 88.2705, 54],
      ])
    case 'teardrop':
      return teardropPath()
    default: {
      const exhaustive: never = shape
      return exhaustive
    }
  }
}

const GEOMETRY: Record<BotMarkShape, BotMarkGeometry> = {
  blob: geometryFor(rawPath('blob'), 'blob'),
  pebble: geometryFor(rawPath('pebble'), 'pebble'),
  squircle: geometryFor(rawPath('squircle'), 'squircle'),
  tablet: geometryFor(rawPath('tablet'), 'tablet'),
  triangle: geometryFor(rawPath('triangle'), 'triangle'),
  hex: geometryFor(rawPath('hex'), 'hex'),
  cloud: geometryFor(rawPath('cloud'), 'cloud'),
  teardrop: geometryFor(rawPath('teardrop'), 'teardrop'),
}

export function botMarkGeometry(shape: BotMarkShape): BotMarkGeometry {
  return GEOMETRY[shape]
}

export function eyeOutlinePath(
  glyph: readonly (readonly [number, number])[],
  anchor: BotEyeAnchor,
  scaleX: number,
  scaleY: number,
  dx: number,
  dy: number
): string {
  let path = ''
  for (let index = 0; index < glyph.length; index++) {
    const point = glyph[index]
    if (!point) continue
    const x = anchor.cx + dx + point[0] * anchor.scale * scaleX
    const y = anchor.cy + dy + point[1] * anchor.scale * scaleY
    path += `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return `${path}Z`
}
