'use client'

import { animate, type Transition, useMotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import {
  type ColumnShiftGL,
  disposeColumnShiftGL,
  drawColumnShift,
  initColumnShiftGL,
  uploadTextTexture,
} from '@/lib/column-shift-gl'
import { resolveCssColorForCanvas } from '@/lib/resolve-css-color-for-canvas'
import { cn } from '@/library/cn'

/** Near GSAP `power2.inOut` — smooth hover like the reference site */
const EASE_IN_OUT_STRONG: [number, number, number, number] = [0.65, 0, 0.35, 1]

export type ColumnShiftHoverTextProps = {
  text: string
  className?: string
  canvasClassName?: string
  /** Disable internal pointer handlers, useful when parent controls hover */
  interactive?: boolean
  /** Controlled hover state from parent (when set, drives uHover) */
  active?: boolean
  /** Normalized horizontal focus (0..1), used for per-letter targeting */
  focusX?: number
  /** Normalized spread for the focus mask (roughly letter width ratio) */
  focusSpread?: number
  /** Animate `uStart` from 1 → 0 on mount (reference-style entrance) */
  intro?: boolean
  introDuration?: number
  introEase?: [number, number, number, number]
  hoverDuration?: number
  hoverEase?: [number, number, number, number]
  /** When set, overrides `hoverDuration` / `hoverEase` (e.g. `{ type: "spring", ... }`) */
  hoverTransition?: Transition
}

export function ColumnShiftHoverText({
  text,
  className,
  canvasClassName,
  interactive = true,
  active,
  focusX = 0.5,
  focusSpread = 0.22,
  intro = true,
  introDuration = 1.15,
  introEase = EASE_IN_OUT_STRONG,
  hoverDuration = 1,
  hoverEase = EASE_IN_OUT_STRONG,
  hoverTransition,
}: ColumnShiftHoverTextProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const glCanvasRef = useRef<HTMLCanvasElement>(null)
  const srcCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const glRef = useRef<ColumnShiftGL | null>(null)
  const fallback2dRef = useRef<CanvasRenderingContext2D | null>(null)

  const uHover = useMotionValue(0)
  const uStart = useMotionValue(intro ? 1 : 0)

  const hoverAnim = useRef<ReturnType<typeof animate> | null>(null)

  const drawFallback2d = useCallback(
    (
      ctx2d: CanvasRenderingContext2D,
      source: HTMLCanvasElement,
      width: number,
      height: number,
      start: number,
      hover: number
    ) => {
      const smoothstep = (edge0: number, edge1: number, x: number) => {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
        return t * t * (3 - 2 * t)
      }

      ctx2d.clearRect(0, 0, width, height)
      const strip = 1
      for (let dx = 0; dx < width; dx += strip) {
        const v = dx / width
        const focusNorm = Math.abs(v - focusX) / Math.max(0.0001, focusSpread)
        const focusMask = 1 - smoothstep(0, 1, focusNorm)
        const hoverLocal = hover * (0.3 + 0.7 * focusMask)
        const strength = hoverLocal * 1.35
        const moder = Math.max(0, Math.min(1, start * 0.5 + strength))

        const cent = (1 - v - 0.5) * 2
        const otro = Math.floor(cent * 16) / 16
        let uX = v - moder * 0.2
        uX -= otro
        uX += hoverLocal * (otro * 0.28)
        uX += (v + hoverLocal) * 1.35 * (hoverLocal * (otro * 0.16))
        const hov = 0.14 * strength
        uX += otro + otro * hov + strength * 0.26

        const sx = Math.max(0, Math.min(width - strip, Math.floor(uX * width)))
        ctx2d.drawImage(source, sx, 0, strip, height, dx, 0, strip, height)
      }
    },
    [focusSpread, focusX]
  )

  const paintAndDraw = useCallback(() => {
    const wrap = wrapRef.current
    const glCan = glCanvasRef.current
    const ctxGl = glRef.current
    const ctx2d = fallback2dRef.current
    if (!wrap || !glCan || (!ctxGl && !ctx2d) || !text) return

    let src = srcCanvasRef.current
    if (!src) {
      src = document.createElement('canvas')
      srcCanvasRef.current = src
    }

    const cs = getComputedStyle(wrap)
    const dpr = Math.min(
      2,
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    )
    const displayW = Math.max(1, Math.floor(wrap.clientWidth))
    const padX = 8 * dpr
    const padY = 6 * dpr

    const weight = cs.fontWeight || '600'
    const family = cs.fontFamily || 'sans-serif'
    const sizePx = parseFloat(cs.fontSize || '48') * dpr
    const resolvedColor = resolveCssColorForCanvas(cs.color || '#111827')

    const sctx = src.getContext('2d')
    if (!sctx) return

    sctx.font = `${weight} ${sizePx}px ${family}`
    const metrics = sctx.measureText(text)
    const texW = Math.max(
      Math.ceil(displayW * dpr),
      Math.ceil(metrics.width + padX * 2)
    )
    const lineH = Math.ceil(sizePx * 1.35)
    const texH = Math.max(lineH + padY * 2, Math.ceil(sizePx + padY * 2))

    if (src.width !== texW || src.height !== texH) {
      src.width = texW
      src.height = texH
    }

    sctx.clearRect(0, 0, texW, texH)
    sctx.font = `${weight} ${sizePx}px ${family}`
    sctx.textBaseline = 'middle'
    sctx.fillStyle = resolvedColor

    const textX = padX
    const textY = texH / 2
    sctx.fillText(text, textX, textY)

    if (glCan.width !== texW || glCan.height !== texH) {
      glCan.width = texW
      glCan.height = texH
    }

    if (ctxGl) {
      uploadTextTexture(ctxGl, src)
      drawColumnShift(
        ctxGl,
        texW,
        texH,
        uStart.get(),
        uHover.get(),
        focusX,
        focusSpread
      )
    } else if (ctx2d) {
      drawFallback2d(ctx2d, src, texW, texH, uStart.get(), uHover.get())
    }

    const aspect = texH / texW
    glCan.style.width = '100%'
    glCan.style.height = 'auto'
    glCan.style.aspectRatio = `${texW} / ${texH}`
    glCan.style.display = 'block'
    glCan.style.minHeight = `${Math.ceil(displayW * aspect)}px`
  }, [drawFallback2d, focusSpread, focusX, text, uHover, uStart])

  useLayoutEffect(() => {
    const glCan = glCanvasRef.current
    if (!glCan) return
    const ctx = initColumnShiftGL(glCan)
    glRef.current = ctx
    if (!ctx) {
      fallback2dRef.current = glCan.getContext('2d')
      if (typeof window !== 'undefined') {
        console.warn(
          '[ColumnShiftHoverText] WebGL init failed, using Canvas2D fallback.'
        )
      }
    } else {
      fallback2dRef.current = null
    }
    return () => {
      if (glRef.current) {
        disposeColumnShiftGL(glRef.current)
        glRef.current = null
      }
      fallback2dRef.current = null
    }
  }, [])

  /** Runs after GL init (same tick, later in declaration order) so `glRef` is always set. */
  useLayoutEffect(() => {
    paintAndDraw()
  }, [paintAndDraw])

  useEffect(() => {
    const unsubHover = uHover.on('change', paintAndDraw)
    const unsubStart = uStart.on('change', paintAndDraw)
    return () => {
      unsubHover()
      unsubStart()
    }
  }, [uHover, uStart, paintAndDraw])

  useEffect(() => {
    if (!intro) {
      uStart.jump(0)
      return
    }
    uStart.jump(1)
    const c = animate(uStart, 0, {
      duration: introDuration,
      ease: introEase,
    })
    return () => c.stop()
  }, [intro, introDuration, introEase, uStart])

  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      paintAndDraw()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [paintAndDraw])

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts?.ready) return
    let cancelled = false
    void document.fonts.ready.then(() => {
      if (!cancelled) paintAndDraw()
    })
    return () => {
      cancelled = true
    }
  }, [paintAndDraw])

  const hoverT =
    hoverTransition ??
    ({
      duration: hoverDuration,
      ease: hoverEase,
    } satisfies Transition)

  useEffect(() => {
    if (typeof active !== 'boolean') return
    hoverAnim.current?.stop()
    hoverAnim.current = animate(uHover, active ? 1 : 0, hoverT)
  }, [active, hoverT, uHover])

  const onEnter = () => {
    hoverAnim.current?.stop()
    hoverAnim.current = animate(uHover, 1, hoverT)
  }

  const onLeave = () => {
    hoverAnim.current?.stop()
    hoverAnim.current = animate(uHover, 0, hoverT)
  }

  return (
    <div
      ref={wrapRef}
      className={cn('block w-full cursor-default select-none', className)}
    >
      {/*
        `pointerenter` does not bubble — the canvas is the hit target, so hover
        handlers must live on the canvas (or use pointer-events-none + parent).
      */}
      <canvas
        ref={glCanvasRef}
        className={cn('w-full touch-manipulation', canvasClassName)}
        aria-label={text}
        role="img"
        onPointerEnter={interactive ? onEnter : undefined}
        onPointerLeave={interactive ? onLeave : undefined}
      />
      <span className="sr-only">{text}</span>
    </div>
  )
}
