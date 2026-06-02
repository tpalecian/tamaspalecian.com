'use client'

import { useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/library/cn'

const VIEWBOX_WIDTH = 30.5
const VIEWBOX_HEIGHT = 26
const O_OFFSET_X = 18.5

/** Default logical grid; override with `config.stippleGrid`. */
const DEFAULT_STIPPLE_GRID = 205
const STIPPLE_GRID_MIN = 128
const STIPPLE_GRID_MAX = 384

function clampStippleGrid(value: number) {
  return Math.max(
    STIPPLE_GRID_MIN,
    Math.min(STIPPLE_GRID_MAX, Math.round(value))
  )
}

const R_PATH =
  'M0.500252 25.5L0.500252 0.5L9.39442 0.5C11.538 0.5 13.362 1.13958 14.8475 2.39992C16.333 3.66027 17.0851 5.37208 17.0851 7.51655C17.0851 9.60459 16.2954 11.2788 14.7159 12.5767C13.1552 13.8935 11.2936 14.5331 9.14997 14.5331L17.6117 24.804V25.4812H13.5312L4.7875 14.5331H4.11057L4.11057 25.5H0.500252V25.5ZM4.09177 11.1095H9.56365C10.6355 11.1095 11.5568 10.7709 12.3466 10.1125C13.1176 9.4541 13.5124 8.58879 13.5124 7.51655C13.5124 6.44432 13.1176 5.57901 12.3466 4.92062C11.5757 4.26223 10.6543 3.92363 9.56365 3.92363L4.09177 3.92363L4.09177 11.1095Z'

const O_PATH =
  'M6.32871 3.52919C7.62617 3.52919 8.67919 4.58261 8.67919 5.88058C8.67919 7.17855 7.62617 8.23197 6.32871 8.23197C5.03125 8.23197 3.97823 7.17855 3.97823 5.88058C3.97823 4.58261 5.03125 3.52919 6.32871 3.52919ZM6.32871 0.70752C3.47053 0.70752 1.15765 3.02129 1.15765 5.88058C1.15765 8.73988 3.47053 11.0536 6.32871 11.0536C9.18689 11.0536 11.4998 8.73988 11.4998 5.88058C11.4998 3.02129 9.18689 0.70752 6.32871 0.70752Z'

type R0ParticleLogoProps = {
  alternateSourceImageUrl?: string
  className?: string
  config?: Partial<R0ParticleLogoConfig>
  href?: string
  sourceImageUrl?: string
}

export type R0ParticleLogoConfig = {
  alternateColor: [number, number, number]
  blurRadius: number
  color: [number, number, number]
  contrast: number
  cornerRadius: number
  /** Smoothing factor applied each frame: displace += (target - displace) * k */
  displacementSmoothing: number
  ditherMode: 'bayer8' | 'floydSteinberg'
  dotJitter: number
  dotScale: number
  errorStrength: number
  gamma: number
  highlightsCompression: number
  /** When true, keep only boundary cells of the stipple mask (hollow / outline look). */
  invert: boolean
  lightInkFloor: number
  luminanceThreshold: number
  /** Pointer repulsion falloff distance in **CSS pixels** (ring radius). */
  mouseRepelRadius: number
  mouseRepelStrength: number
  negateLuminance: boolean
  /** Multiplier × device pixel ratio, capped by `pixelRatioCap` (use >1 when recording). */
  pixelRatioScale: number
  /** Upper bound for effective canvas DPR (higher = sharper, heavier). */
  pixelRatioCap: number
  scale: number
  serpentine: boolean
  /** Square stipple sampling resolution (larger = finer halftone detail, more CPU). */
  stippleGrid: number
  shockwaveDuration: number
  shockwaveSpeed: number
  shockwaveStrength: number
  shockwaveWidth: number
  swapDecay: number
  swapImpulse: number
}

export const defaultR0ParticleLogoConfig: R0ParticleLogoConfig = {
  alternateColor: [1, 0, 144 / 255],
  blurRadius: 0,
  color: [0, 0, 0],
  contrast: 0,
  cornerRadius: 0,
  displacementSmoothing: 0.12,
  ditherMode: 'floydSteinberg',
  dotJitter: 0.45,
  dotScale: 0.72,
  errorStrength: 1,
  gamma: 1.03,
  highlightsCompression: 0,
  invert: false,
  lightInkFloor: 0.018,
  luminanceThreshold: 98,
  mouseRepelRadius: 100,
  mouseRepelStrength: 40,
  negateLuminance: false,
  pixelRatioScale: 1,
  pixelRatioCap: 4,
  scale: 0.5,
  serpentine: true,
  stippleGrid: 280,
  shockwaveDuration: 675,
  shockwaveSpeed: 225,
  shockwaveStrength: 20,
  shockwaveWidth: 37,
  swapDecay: 0.91,
  swapImpulse: 0.14,
}

const BUCKET_COUNT = 126

function seeded(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const BAYER8 = new Uint8Array([
  0, 48, 12, 60, 3, 51, 15, 63, 32, 16, 44, 28, 35, 19, 47, 31, 8, 56, 4, 52,
  11, 59, 7, 55, 40, 24, 36, 20, 43, 27, 39, 23, 2, 50, 14, 62, 1, 49, 13, 61,
  34, 18, 46, 30, 33, 17, 45, 29, 10, 58, 6, 54, 9, 57, 5, 53, 42, 26, 38, 22,
  41, 25, 37, 21,
])

const ALPHA_REJECT = 0.018

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

function paintLogoSource(
  width: number,
  height: number,
  config: R0ParticleLogoConfig,
  sourceImage: HTMLImageElement | null
) {
  const source = document.createElement('canvas')
  source.width = width
  source.height = height

  const context = source.getContext('2d')
  if (!context) return source

  const padding = Math.max(2, Math.round(width * 0.035))
  const scale = Math.min(
    (width - padding * 2) / VIEWBOX_WIDTH,
    (height - padding * 2) / VIEWBOX_HEIGHT
  )
  const tx = (width - VIEWBOX_WIDTH * scale) / 2
  const ty = (height - VIEWBOX_HEIGHT * scale) / 2

  context.clearRect(0, 0, width, height)
  context.save()
  if (config.cornerRadius > 0) {
    const radius = Math.min(width, height) * config.cornerRadius
    context.beginPath()
    context.roundRect(0, 0, width, height, radius)
    context.clip()
  }
  if (config.blurRadius > 0) {
    context.filter = `blur(${config.blurRadius}px)`
  }

  if (sourceImage) {
    const imageScale = Math.min(
      (width - padding * 2) / sourceImage.naturalWidth,
      (height - padding * 2) / sourceImage.naturalHeight
    )
    const imageWidth = sourceImage.naturalWidth * imageScale
    const imageHeight = sourceImage.naturalHeight * imageScale
    context.drawImage(
      sourceImage,
      (width - imageWidth) / 2,
      (height - imageHeight) / 2,
      imageWidth,
      imageHeight
    )
  } else {
    context.translate(tx, ty)
    context.scale(scale, scale)
    context.fillStyle = '#000'
    context.fill(new Path2D(R_PATH))
    context.translate(O_OFFSET_X, 0)
    context.fill(new Path2D(O_PATH))
  }
  context.restore()

  return source
}

type StippleCell = { brightness: number; gx: number; gy: number }

function outlineMaskFilter(
  gridSize: number,
  cells: StippleCell[]
): StippleCell[] {
  const set = new Set<number>()
  for (const cell of cells) {
    const gx = Math.floor(cell.gx)
    const gy = Math.floor(cell.gy)
    set.add(gy * gridSize + gx)
  }
  return cells.filter((cell) => {
    const gx = Math.floor(cell.gx)
    const gy = Math.floor(cell.gy)
    return (
      !set.has(gy * gridSize + gx + 1) ||
      !set.has(gy * gridSize + gx - 1) ||
      !set.has((gy + 1) * gridSize + gx) ||
      !set.has((gy - 1) * gridSize + gx)
    )
  })
}

function buildStippleCells(
  config: R0ParticleLogoConfig,
  sourceImage: HTMLImageElement | null
): StippleCell[] {
  const grid = clampStippleGrid(config.stippleGrid ?? DEFAULT_STIPPLE_GRID)
  const w = grid
  const h = grid
  const source = paintLogoSource(w, h, config, sourceImage)
  const gridWidth = w
  const gridHeight = h

  const context = source.getContext('2d')
  if (!context) return []

  const ditherSource = document.createElement('canvas')
  ditherSource.width = gridWidth
  ditherSource.height = gridHeight
  const dctx = ditherSource.getContext('2d')
  if (!dctx) return []

  dctx.imageSmoothingEnabled = true
  dctx.imageSmoothingQuality = 'high'
  dctx.clearRect(0, 0, gridWidth, gridHeight)
  dctx.drawImage(source, 0, 0, gridWidth, gridHeight)

  const pixels = dctx.getImageData(0, 0, gridWidth, gridHeight).data
  const threshold = config.luminanceThreshold / 255
  const errorStrength = config.errorStrength
  const cellCount = gridWidth * gridHeight
  const valuesGrid = new Float32Array(cellCount)
  const alphaGrid = new Float32Array(cellCount)

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const px = (gy * gridWidth + gx) * 4
      const red = (pixels[px] ?? 0) / 255
      const green = (pixels[px + 1] ?? 0) / 255
      const blue = (pixels[px + 2] ?? 0) / 255
      const alpha = (pixels[px + 3] ?? 0) / 255
      const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
      let value = (1 - luminance) * alpha
      if (config.negateLuminance) value = 1 - value
      value = (value - 0.5) * (1 + config.contrast) + 0.5
      value = Math.max(0, Math.min(1, value)) ** (1 / config.gamma)
      value = value * (1 - config.highlightsCompression)
      const idx = gy * gridWidth + gx
      valuesGrid[idx] = Math.max(0, Math.min(1, value))
      alphaGrid[idx] = alpha
    }
  }

  if (config.ditherMode === 'floydSteinberg') {
    for (let i = 0; i < cellCount; i++) {
      const a = alphaGrid[i] ?? 0
      if (a >= ALPHA_REJECT) {
        valuesGrid[i] = Math.max(
          valuesGrid[i] ?? 0,
          config.lightInkFloor * Math.min(1, a * 2)
        )
      }
    }

    const addError = (
      gx: number,
      gy: number,
      error: number,
      factor: number
    ) => {
      if (gx < 0 || gx >= gridWidth || gy < 0 || gy >= gridHeight) return
      const index = gy * gridWidth + gx
      valuesGrid[index] = valuesGrid[index] + error * factor * errorStrength
    }

    for (let gy = 0; gy < gridHeight; gy++) {
      const reverse = config.serpentine && gy % 2 === 1
      for (let i = 0; i < gridWidth; i++) {
        const gx = reverse ? gridWidth - 1 - i : i
        const index = gy * gridWidth + gx
        const oldValue = valuesGrid[index] ?? 0
        const newValue = oldValue > threshold ? 1 : 0
        const error = oldValue - newValue
        valuesGrid[index] = newValue

        const dir = reverse ? -1 : 1
        addError(gx + dir, gy, error, 7 / 16)
        addError(gx - dir, gy + 1, error, 3 / 16)
        addError(gx, gy + 1, error, 5 / 16)
        addError(gx + dir, gy + 1, error, 1 / 16)
      }
    }
  }

  const raw: StippleCell[] = []

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const idx = gy * gridWidth + gx
      const alpha = alphaGrid[idx] ?? 0
      if (alpha < ALPHA_REJECT) continue

      let place = false
      let brightness = valuesGrid[idx] ?? 0

      if (config.ditherMode === 'floydSteinberg') {
        place = (valuesGrid[idx] ?? 0) > 0
        brightness = Math.min(1, threshold + (valuesGrid[idx] ?? 0) * 0.15)
      } else {
        let ink = valuesGrid[idx] ?? 0
        ink = Math.max(ink, config.lightInkFloor * Math.min(1, alpha * 2))
        const b = BAYER8[(gy & 7) * 8 + (gx & 7)] ?? 0
        const scaledInk = ink * 64
        place = ink >= 0.992 || scaledInk > b
        brightness = ink
      }

      if (!place) continue

      raw.push({
        gx: gx + 0.5,
        gy: gy + 0.5,
        brightness: Math.max(0, Math.min(1, brightness)),
      })
    }
  }

  const cells = raw.map((cell, i) => ({
    ...cell,
    gx: cell.gx + (seeded(i * 2 + 1) - 0.5) * config.dotJitter,
    gy: cell.gy + (seeded(i * 2 + 2) - 0.5) * config.dotJitter,
  }))

  if (config.invert) return outlineMaskFilter(grid, cells)
  return cells
}

type Shockwave = { start: number; x: number; y: number }
type BlastWave = {
  explodeDuration: number
  returnDuration: number
  start: number
  swapped: boolean
}

function mixColor(
  from: [number, number, number],
  to: [number, number, number],
  t: number
): [number, number, number] {
  const k = Math.max(0, Math.min(1, t))
  return [
    from[0] + (to[0] - from[0]) * k,
    from[1] + (to[1] - from[1]) * k,
    from[2] + (to[2] - from[2]) * k,
  ]
}

function easeOutCubic(t: number) {
  const k = Math.max(0, Math.min(1, t))
  return 1 - (1 - k) ** 3
}

export function R0ParticleLogo({
  alternateSourceImageUrl,
  className,
  config,
  href = '/',
  sourceImageUrl,
}: R0ParticleLogoProps) {
  const reduceMotion = useReducedMotion() ?? false
  const linkRef = useRef<HTMLAnchorElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const resolvedConfig = { ...defaultR0ParticleLogoConfig, ...config }
  const configKey = JSON.stringify(resolvedConfig)

  useEffect(() => {
    const link = linkRef.current
    const canvas = canvasRef.current
    if (!link || !canvas || reduceMotion) return

    const tuning = JSON.parse(configKey) as R0ParticleLogoConfig

    const sourceImagePromise = sourceImageUrl
      ? loadImage(sourceImageUrl).catch(() => null)
      : Promise.resolve(null)
    const alternateSourceImagePromise = alternateSourceImageUrl
      ? loadImage(alternateSourceImageUrl).catch(() => null)
      : Promise.resolve(null)

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    setIsCanvasReady(true)

    let disposed = false
    let activeSourceIndex = 0
    let clickCharge = 0
    let lastClickAt = 0
    let blastWave: BlastWave | null = null
    let swapQueued = false
    let colorBlend = 1
    let colorBlendFrom: [number, number, number] = tuning.color
    let colorBlendTo: [number, number, number] = tuning.color
    const rapidClickWindowMs = 280
    const chargeResetWindowMs = 520
    let previousFrameTime = performance.now()
    const mouse = { x: 0, y: 0 }
    let mouseActive = false
    let mouseIsMouse = false
    const shockwaves: Shockwave[] = []

    let cells: StippleCell[] = []
    let displaceX: Float32Array = new Float32Array()
    let displaceY: Float32Array = new Float32Array()
    let targetX: Float32Array = new Float32Array()
    let targetY: Float32Array = new Float32Array()
    let particleCount = 0

    let cssWidth = 1
    let cssHeight = 1
    let dpr = 1

    const getActiveSource = async () => {
      if (activeSourceIndex === 1) return alternateSourceImagePromise
      return sourceImagePromise
    }

    const layoutScale = () => {
      const narrow = window.matchMedia('(max-width: 640px)').matches
      const layout = narrow ? 0.8 : 1
      return tuning.scale * layout
    }

    const rebuild = async (preserveDisplacement = false) => {
      const rect = link.getBoundingClientRect()
      const devicePr = window.devicePixelRatio || 1
      const prScale = tuning.pixelRatioScale
      const prCap = tuning.pixelRatioCap
      dpr = Math.min(prCap, devicePr * prScale)
      cssWidth = Math.max(1, rect.width)
      cssHeight = Math.max(1, rect.height)
      const bufferW = Math.max(1, Math.round(cssWidth * dpr))
      const bufferH = Math.max(1, Math.round(cssHeight * dpr))

      if (canvas.width !== bufferW || canvas.height !== bufferH) {
        canvas.width = bufferW
        canvas.height = bufferH
      }

      const sourceImage = await getActiveSource()
      if (disposed) return

      const nextCells = buildStippleCells(tuning, sourceImage)
      const nextCount = nextCells.length
      const nextDisplaceX = new Float32Array(nextCount)
      const nextDisplaceY = new Float32Array(nextCount)

      if (preserveDisplacement) {
        const copyCount = Math.min(
          nextCount,
          displaceX.length,
          displaceY.length
        )
        for (let i = 0; i < copyCount; i++) {
          nextDisplaceX[i] = displaceX[i] ?? 0
          nextDisplaceY[i] = displaceY[i] ?? 0
        }
      }

      cells = nextCells
      particleCount = nextCount
      displaceX = nextDisplaceX
      displaceY = nextDisplaceY
      targetX = new Float32Array(particleCount)
      targetY = new Float32Array(particleCount)
    }

    const bucketIndex = (brightness: number, tint: number) => {
      const v = 6 * Math.round(20 * brightness) + Math.round(5 * tint)
      return Math.max(0, Math.min(BUCKET_COUNT - 1, v))
    }

    const drawFrame = (time: number): boolean => {
      if (disposed) return false
      const dt = Math.min(100, Math.max(1, time - previousFrameTime))
      previousFrameTime = time

      const scaleLayout = layoutScale()
      const w = cssWidth * dpr
      const h = cssHeight * dpr
      const grid = clampStippleGrid(tuning.stippleGrid ?? DEFAULT_STIPPLE_GRID)
      const cell = Math.max(0.5, (Math.min(w, h) * scaleLayout) / grid)
      const offsetX = Math.round((w - grid * cell) / 2)
      const offsetY = Math.round((h - grid * cell) / 2)
      const dot = cell * tuning.dotScale

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const s = shockwaves[i]
        if (!s) continue
        if (time - s.start > tuning.shockwaveDuration) {
          shockwaves.splice(i, 1)
        }
      }

      for (let i = 0; i < particleCount; i++) {
        targetX[i] = 0
        targetY[i] = 0
      }

      clickCharge = Math.max(0, clickCharge - dt * 0.00095)

      if (mouseActive && mouseIsMouse) {
        const mx = mouse.x * dpr
        const my = mouse.y * dpr
        const r = tuning.mouseRepelRadius * dpr
        const rSq = r * r
        for (let i = 0; i < particleCount; i++) {
          const cellData = cells[i]
          if (!cellData) continue
          const bx = offsetX + cellData.gx * cell
          const by = offsetY + cellData.gy * cell
          const px = bx + (displaceX[i] ?? 0)
          const py = by + (displaceY[i] ?? 0)
          let dx = px - mx
          let dy = py - my
          const dSq = dx * dx + dy * dy
          if (dSq >= rSq || dSq < 0.01) continue
          const L = Math.sqrt(dSq)
          const S = 1 - L / r
          const a = S * S * S * tuning.mouseRepelStrength * dpr
          dx /= L
          dy /= L
          targetX[i] = (targetX[i] ?? 0) + dx * a
          targetY[i] = (targetY[i] ?? 0) + dy * a
        }
      }

      if (clickCharge > 0.001) {
        const bx = mouse.x * dpr
        const by = mouse.y * dpr
        const r = tuning.mouseRepelRadius * (1.2 + clickCharge * 1.55) * dpr
        const rSq = r * r
        const boost =
          (0.45 + clickCharge * 2.4) * tuning.mouseRepelStrength * dpr

        for (let i = 0; i < particleCount; i++) {
          const cellData = cells[i]
          if (!cellData) continue
          const px = offsetX + cellData.gx * cell + (displaceX[i] ?? 0)
          const py = offsetY + cellData.gy * cell + (displaceY[i] ?? 0)
          let dx = px - bx
          let dy = py - by
          const dSq = dx * dx + dy * dy
          if (dSq >= rSq || dSq < 0.01) continue
          const L = Math.sqrt(dSq)
          const S = 1 - L / r
          const a = S * S * S * boost
          dx /= L
          dy /= L
          targetX[i] = (targetX[i] ?? 0) + dx * a
          targetY[i] = (targetY[i] ?? 0) + dy * a
        }
      }

      for (const s of shockwaves) {
        const elapsed = time - s.start
        const radius = (elapsed / 1000) * tuning.shockwaveSpeed * dpr
        const life = 1 - elapsed / tuning.shockwaveDuration
        if (life <= 0) continue
        const wx = s.x * dpr
        const wy = s.y * dpr
        const width = tuning.shockwaveWidth * dpr
        for (let i = 0; i < particleCount; i++) {
          const cellData = cells[i]
          if (!cellData) continue
          const bx = offsetX + cellData.gx * cell
          const by = offsetY + cellData.gy * cell
          const px = bx + (displaceX[i] ?? 0)
          const py = by + (displaceY[i] ?? 0)
          let dx = px - wx
          let dy = py - wy
          const dist = Math.hypot(dx, dy)
          if (dist < 0.1) continue
          const band = Math.abs(dist - radius)
          if (band >= width) continue
          const falloff =
            (1 - band / width) * life * tuning.shockwaveStrength * dpr
          dx /= dist
          dy /= dist
          targetX[i] = (targetX[i] ?? 0) + dx * falloff
          targetY[i] = (targetY[i] ?? 0) + dy * falloff
        }
      }

      let blastVisual = 0
      if (blastWave) {
        const elapsed = time - blastWave.start
        const totalDuration =
          blastWave.explodeDuration + blastWave.returnDuration
        const centerX = offsetX + (grid * cell) / 2
        const centerY = offsetY + (grid * cell) / 2
        const explodeDistance = Math.min(w, h) * 0.44
        const edgeInset = Math.max(8, dot * 1.8)

        let explodeProgress = 0
        if (elapsed <= blastWave.explodeDuration) {
          explodeProgress = easeOutCubic(elapsed / blastWave.explodeDuration)
        } else {
          if (!blastWave.swapped && swapQueued && alternateSourceImageUrl) {
            blastWave.swapped = true
            swapQueued = false
            const nextSource = activeSourceIndex === 0 ? 1 : 0
            const nextColor =
              nextSource === 0 ? tuning.color : tuning.alternateColor
            const currentColor =
              activeSourceIndex === 0 ? tuning.color : tuning.alternateColor
            colorBlendFrom = currentColor
            colorBlendTo = nextColor
            colorBlend = 0
            activeSourceIndex = nextSource
            void rebuild(true)
          }

          const backT =
            (elapsed - blastWave.explodeDuration) / blastWave.returnDuration
          explodeProgress = 1 - easeOutCubic(backT)
        }

        if (elapsed >= totalDuration) {
          blastWave = null
        }

        if (explodeProgress > 0) {
          blastVisual = explodeProgress
          for (let i = 0; i < particleCount; i++) {
            const cellData = cells[i]
            if (!cellData) continue
            const baseX = offsetX + cellData.gx * cell
            const baseY = offsetY + cellData.gy * cell
            let dx = baseX - centerX
            let dy = baseY - centerY
            const L = Math.max(0.001, Math.hypot(dx, dy))
            dx /= L
            dy /= L
            const desiredX = baseX + dx * explodeDistance * explodeProgress
            const desiredY = baseY + dy * explodeDistance * explodeProgress
            const clampedX = Math.max(
              edgeInset,
              Math.min(w - edgeInset, desiredX)
            )
            const clampedY = Math.max(
              edgeInset,
              Math.min(h - edgeInset, desiredY)
            )
            targetX[i] = clampedX - baseX
            targetY[i] = clampedY - baseY
          }
        }
      }

      const smooth = tuning.displacementSmoothing
      let moving = shockwaves.length > 0 || (mouseActive && mouseIsMouse)

      for (let i = 0; i < particleCount; i++) {
        const tx = targetX[i] ?? 0
        const ty = targetY[i] ?? 0
        const dx0 = displaceX[i] ?? 0
        const dy0 = displaceY[i] ?? 0
        displaceX[i] = dx0 + (tx - dx0) * smooth
        displaceY[i] = dy0 + (ty - dy0) * smooth
        if (Math.abs(displaceX[i] ?? 0) < 0.01) displaceX[i] = 0
        if (Math.abs(displaceY[i] ?? 0) < 0.01) displaceY[i] = 0
        if ((displaceX[i] ?? 0) !== 0 || (displaceY[i] ?? 0) !== 0) {
          moving = true
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Keep the source-color crossfade readable during the return phase.
      colorBlend = Math.min(1, colorBlend + dt * 0.0024)
      const sourceColor =
        activeSourceIndex === 0 ? tuning.color : tuning.alternateColor
      const activeColor =
        colorBlend < 1
          ? mixColor(colorBlendFrom, colorBlendTo, colorBlend)
          : sourceColor
      const [cr, cg, cb] = activeColor
      const fillR = Math.round(cr * 255)
      const fillG = Math.round(cg * 255)
      const fillB = Math.round(cb * 255)
      const blastKeepRatio =
        blastVisual > 0 ? Math.max(0.16, 1 - blastVisual * 0.84) : 1

      const buckets: number[][] = Array.from({ length: BUCKET_COUNT }, () => [])
      for (let i = 0; i < particleCount; i++) {
        const cellData = cells[i]
        if (!cellData) continue
        if (blastKeepRatio < 1 && seeded(i * 17 + 3) > blastKeepRatio) continue
        const bi = bucketIndex(cellData.brightness, 0)
        buckets[bi]?.push(i)
      }

      for (let b = 0; b < BUCKET_COUNT; b++) {
        const list = buckets[b]
        if (!list || list.length === 0) continue
        const alpha = (b + 1) / (BUCKET_COUNT + 2)
        ctx.fillStyle = `rgba(${fillR},${fillG},${fillB},${alpha})`
        for (const i of list) {
          const cellData = cells[i]
          if (!cellData) continue
          const bx = offsetX + cellData.gx * cell
          const by = offsetY + cellData.gy * cell
          const x = bx + (displaceX[i] ?? 0)
          const y = by + (displaceY[i] ?? 0)
          ctx.fillRect(x - 0.25, y - 0.25, dot + 0.5, dot + 0.5)
        }
      }

      if (clickCharge > 0 || blastWave || colorBlend < 1) moving = true

      return moving
    }

    const loop = (time: number) => {
      if (disposed) return
      const moving = drawFrame(time)
      if (moving) {
        frameRef.current = requestAnimationFrame(loop)
      } else {
        frameRef.current = null
      }
    }

    const start = () => {
      if (frameRef.current == null) {
        frameRef.current = requestAnimationFrame(loop)
      }
    }

    const syncPointerCss = (event: PointerEvent) => {
      const rect = link.getBoundingClientRect()
      mouse.x = Math.max(0, Math.min(rect.width, event.clientX - rect.left))
      mouse.y = Math.max(0, Math.min(rect.height, event.clientY - rect.top))
    }

    const onPointerEnter = (event: PointerEvent) => {
      syncPointerCss(event)
      mouseActive = true
      mouseIsMouse = event.pointerType === 'mouse'
      start()
    }

    const onPointerMove = (event: PointerEvent) => {
      syncPointerCss(event)
      mouseActive = true
      mouseIsMouse = event.pointerType === 'mouse'
      start()
    }

    const onPointerLeave = () => {
      mouseActive = false
      mouseIsMouse = false
      start()
    }

    const onPointerDown = (event: PointerEvent) => {
      syncPointerCss(event)
      const now = performance.now()
      const elapsedSinceLastClick = now - lastClickAt
      if (elapsedSinceLastClick > chargeResetWindowMs) {
        clickCharge *= 0.2
      }
      const quickRepeat = elapsedSinceLastClick < rapidClickWindowMs
      clickCharge = Math.min(
        1.18,
        clickCharge +
          tuning.swapImpulse * (quickRepeat ? 1.65 : 1.05) +
          (quickRepeat ? 0.08 : 0.03)
      )
      lastClickAt = now
      if (alternateSourceImageUrl && clickCharge >= 1 && !blastWave) {
        clickCharge = 0
        swapQueued = true
        blastWave = {
          start: now,
          explodeDuration: Math.max(180, tuning.shockwaveDuration * 0.4),
          returnDuration: Math.max(340, tuning.shockwaveDuration * 0.95),
          swapped: false,
        }
      }
      start()
    }

    const onPointerUp = (event: PointerEvent) => {
      syncPointerCss(event)
      shockwaves.push({
        x: mouse.x,
        y: mouse.y,
        start: performance.now(),
      })
      start()
    }

    void rebuild().then(() => {
      if (!disposed) start()
    })

    const resizeObserver = new ResizeObserver(() => {
      void rebuild().then(() => start())
    })
    resizeObserver.observe(link)
    link.addEventListener('pointerenter', onPointerEnter)
    link.addEventListener('pointermove', onPointerMove)
    link.addEventListener('pointerleave', onPointerLeave)
    link.addEventListener('pointerdown', onPointerDown)
    link.addEventListener('pointerup', onPointerUp)

    return () => {
      disposed = true
      resizeObserver.disconnect()
      link.removeEventListener('pointerenter', onPointerEnter)
      link.removeEventListener('pointermove', onPointerMove)
      link.removeEventListener('pointerleave', onPointerLeave)
      link.removeEventListener('pointerdown', onPointerDown)
      link.removeEventListener('pointerup', onPointerUp)
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      setIsCanvasReady(false)
    }
  }, [alternateSourceImageUrl, configKey, reduceMotion, sourceImageUrl])

  return (
    <Link
      ref={linkRef}
      aria-current="page"
      aria-label="Back to home"
      className={cn(
        'relative block aspect-[30.5/26] w-[min(14rem,56vw)] touch-manipulation',
        className
      )}
      href={href}
    >
      <svg
        aria-hidden="true"
        className={cn(
          'absolute inset-0 h-full w-full fill-stone-700 transition-opacity duration-300',
          isCanvasReady && !reduceMotion ? 'opacity-0' : 'opacity-100'
        )}
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        <path d={R_PATH} />
        <path d={O_PATH} transform={`translate(${O_OFFSET_X} 0)`} />
      </svg>
      <canvas
        className={cn(
          'absolute inset-0 h-full w-full transition-opacity duration-300',
          isCanvasReady && !reduceMotion ? 'opacity-100' : 'opacity-0'
        )}
        ref={canvasRef}
      />
    </Link>
  )
}
