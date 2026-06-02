'use client'

import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import SplitType from 'split-type'
import {
  type ColumnShiftGL,
  disposeColumnShiftGL,
  drawColumnShift,
  initColumnShiftGL,
  uploadTextTexture,
} from '@/lib/column-shift-gl'
import { resolveCssColorForCanvas } from '@/lib/resolve-css-color-for-canvas'
import { cn } from '@/library/cn'

type ColumnShiftHoverWordProps = {
  text: string
  className?: string
  letterClassName?: string
  intro?: boolean
  hoverDuration?: number
}

const clamp = (min: number, max: number, value: number) =>
  Math.max(min, Math.min(max, value))

export function ColumnShiftHoverWord({
  text,
  className,
  letterClassName,
  intro = true,
  hoverDuration = 1,
}: ColumnShiftHoverWordProps) {
  const wrapRef = useRef<HTMLSpanElement | null>(null)
  const textRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const glRef = useRef<ColumnShiftGL | null>(null)

  const sourceRef = useRef<HTMLCanvasElement | null>(null)
  const startsRef = useRef<number[]>([])
  const widthsRef = useRef<number[]>([])
  const targetRef = useRef<number[]>([])
  const currentRef = useRef<number[]>([])
  const activeCharRef = useRef(-1)
  const pointerXRef = useRef(0)
  const focusXRef = useRef(0.5)
  const spreadRef = useRef(0.18)
  const lerpRef = useRef(0.06)
  const rafRef = useRef<number | null>(null)

  const stateRef = useRef({ start: intro ? 1 : 0, power: 0 })
  const powerTweenRef = useRef<gsap.core.Tween | null>(null)
  const introTweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const textEl = textRef.current
    const canvas = canvasRef.current
    if (!wrap || !textEl || !canvas) return

    const gl = initColumnShiftGL(canvas)
    glRef.current = gl

    const split = new SplitType(textEl, { types: 'chars,words' })
    const chars = Array.from(textEl.querySelectorAll<HTMLElement>('.char'))
    for (const node of chars) {
      if (letterClassName) {
        for (const c of letterClassName.split(' ')) {
          if (c) node.classList.add(c)
        }
      }
      /* Force invisible ink so canvas is the sole visible text layer. */
      node.classList.add('!text-transparent', 'select-none')
    }

    const ensureSource = () => {
      if (!sourceRef.current)
        sourceRef.current = document.createElement('canvas')
      return sourceRef.current
    }

    const recalcChars = () => {
      let cursor = 0
      const starts: number[] = []
      const widths: number[] = []
      for (const charEl of chars) {
        const w = Math.max(1, charEl.getBoundingClientRect().width)
        starts.push(cursor)
        widths.push(w)
        cursor += w
      }
      startsRef.current = starts
      widthsRef.current = widths
      targetRef.current = widths.map(() => 0)
      currentRef.current = widths.map(() => 0)
    }

    const calcTargets = (localX: number, fixed?: number) => {
      const starts = startsRef.current
      const widths = widthsRef.current
      if (starts.length === 0) return

      const out: number[] = []
      if (fixed != null) {
        for (let i = 0; i < starts.length; i++) out.push(fixed)
      } else {
        for (let i = 0; i < starts.length; i++) {
          const rel = localX - starts[i]
          const norm = rel / Math.max(1, widths[i]) - 0.5
          out.push(clamp(-0.5, 0.5, norm))
        }
      }
      targetRef.current = out
    }

    const draw2d = (
      dctx: CanvasRenderingContext2D,
      source: HTMLCanvasElement,
      w: number,
      h: number,
      dpr: number,
      sampleW: number,
      bleed: number
    ) => {
      dctx.clearRect(0, 0, w, h)
      const start = stateRef.current.start
      const powerPhase = stateRef.current.power
      const current = currentRef.current
      const starts = startsRef.current
      const widths = widthsRef.current
      const focus = focusXRef.current
      const spread = spreadRef.current

      let charIndex = 0
      const pxStarts = starts.map((x) => x * dpr)
      const pxWidths = widths.map((x) => x * dpr)

      for (let x = 0; x < w; x++) {
        while (
          charIndex < pxStarts.length - 1 &&
          x > pxStarts[charIndex] + pxWidths[charIndex]
        ) {
          charIndex++
        }

        const sampleX = x + bleed
        const vx = sampleX / sampleW
        const focusSample = (focus * w + bleed) / sampleW
        const focusNorm = Math.abs(vx - focusSample) / Math.max(0.0001, spread)
        const focusMask = 1 - clamp(0, 1, focusNorm)

        const hoverLocal = powerPhase * (0.3 + 0.7 * focusMask)
        const strength = hoverLocal * 1.35
        const moder = clamp(0, 1, start * 0.5 + strength)
        const centpos = vx + moder
        const cent = 2 * (0.5 - vx)
        const otro = Math.floor(cent * 16) / 16
        const hov = 0.14 * strength

        let uX = vx - moder * 0.2
        uX -= otro
        uX += moder * (otro * 0.28)
        uX += centpos * 1.35 * (moder * (otro * 0.16))
        uX += otro + otro * hov + strength * 0.26
        uX += (current[charIndex] ?? 0) * powerPhase * 0.12
        if (activeCharRef.current === charIndex) uX += powerPhase * 0.02

        const sx = clamp(0, sampleW - 1, Math.floor(uX * sampleW))
        dctx.drawImage(source, sx, 0, 1, h, x, 0, 1, h)
      }
      /* No destination-in: one warped sample per column (like fragment texture2D(U)),
      so gaps can open between vertical bands instead of ink sliding in a fixed mask. */
    }

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const rect = textEl.getBoundingClientRect()
      const displayW = Math.max(1, Math.ceil(rect.width))
      const displayH = Math.max(1, Math.ceil(rect.height))
      const w = Math.max(1, Math.ceil(displayW * dpr))
      const h = Math.max(1, Math.ceil(displayH * dpr))
      const bleed = Math.ceil(56 * dpr)
      const sampleW = w + bleed * 2

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        canvas.style.width = `${displayW}px`
        canvas.style.height = `${displayH}px`
      }

      const source = ensureSource()
      if (source.width !== sampleW || source.height !== h) {
        source.width = sampleW
        source.height = h
      }

      const sctx = source.getContext('2d')
      if (!sctx) return

      const css = getComputedStyle(wrap)
      const fontSize = parseFloat(css.fontSize || '48') * dpr
      sctx.clearRect(0, 0, sampleW, h)
      sctx.font = `${css.fontWeight || '600'} ${fontSize}px ${css.fontFamily || 'sans-serif'}`
      sctx.textBaseline = 'middle'
      sctx.fillStyle = resolveCssColorForCanvas(css.color || '#111827')
      sctx.fillText(text, bleed + 8 * dpr, h / 2)

      const start = stateRef.current.start
      const power = stateRef.current.power
      const current = currentRef.current
      const lerp = lerpRef.current
      const target = targetRef.current
      for (let i = 0; i < current.length; i++) {
        const t = target[i] ?? 0
        const c = current[i] ?? 0
        current[i] = c + (t - c) * lerp
      }

      const glCtx = glRef.current
      if (glCtx) {
        const focusU = (focusXRef.current * w + bleed) / sampleW
        const nudge =
          activeCharRef.current >= 0
            ? (current[activeCharRef.current] ?? 0) * power * 0.12
            : 0
        uploadTextTexture(glCtx, source)
        drawColumnShift(
          glCtx,
          w,
          h,
          start,
          power,
          focusU,
          spreadRef.current,
          bleed / sampleW,
          (bleed + w) / sampleW,
          nudge
        )
        return
      }

      const dctx = canvas.getContext('2d')
      if (!dctx) return
      draw2d(dctx, source, w, h, dpr, sampleW, bleed)
    }

    const startLoop = () => {
      if (rafRef.current != null) return
      const tick = () => {
        draw()
        const cur = currentRef.current
        const tar = targetRef.current
        let moving = false
        for (let i = 0; i < cur.length; i++) {
          if (Math.abs((tar[i] ?? 0) - (cur[i] ?? 0)) > 0.001) {
            moving = true
            break
          }
        }
        const s = stateRef.current
        if (moving || s.start > 0.001 || s.power > 0.001) {
          rafRef.current = window.requestAnimationFrame(tick)
        } else {
          rafRef.current = null
        }
      }
      rafRef.current = window.requestAnimationFrame(tick)
    }

    const setPointerFromEvent = (event: PointerEvent | MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      pointerXRef.current = clamp(0, rect.width, event.clientX - rect.left)
      calcTargets(pointerXRef.current)
      startLoop()
    }

    const activate = () => {
      lerpRef.current = 0.06
      powerTweenRef.current?.kill()
      powerTweenRef.current = gsap.to(stateRef.current, {
        power: 1,
        duration: 0.36,
        ease: 'power4.inOut',
        onUpdate: startLoop,
      })
      startLoop()
    }

    const deactivate = () => {
      lerpRef.current = 0.03
      powerTweenRef.current?.kill()
      powerTweenRef.current = gsap.to(stateRef.current, {
        power: 0,
        duration: Math.max(0.6, hoverDuration * 0.6),
        ease: 'none',
        onUpdate: startLoop,
      })
      const side =
        pointerXRef.current < (textEl.clientWidth || 0) * 0.5 ? 0.5 : -0.5
      calcTargets(pointerXRef.current, side)
      activeCharRef.current = -1
      startLoop()
    }

    const onEnter = (event: PointerEvent) => {
      setPointerFromEvent(event)
      activate()
    }
    const onMove = (event: PointerEvent) => setPointerFromEvent(event)
    const onLeave = () => deactivate()

    wrap.addEventListener('pointerenter', onEnter)
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', onLeave)

    const charHandlers = chars.map((charEl, index) => {
      const onCharEnter = (event: Event) => {
        const rect = wrap.getBoundingClientRect()
        const c = (event.currentTarget as HTMLElement).getBoundingClientRect()
        pointerXRef.current = clamp(
          0,
          rect.width,
          c.left - rect.left + c.width / 2
        )
        activeCharRef.current = index
        focusXRef.current = clamp(
          0,
          1,
          pointerXRef.current / Math.max(1, rect.width)
        )
        spreadRef.current = clamp(0.05, 0.28, c.width / Math.max(1, rect.width))
        setPointerFromEvent(event as MouseEvent)
        activate()
      }
      charEl.addEventListener('mouseenter', onCharEnter)
      return { node: charEl, onCharEnter }
    })

    if (intro) {
      introTweenRef.current = gsap.to(stateRef.current, {
        start: 0,
        duration: 0.8,
        ease: 'power4.inOut',
        onUpdate: startLoop,
        onComplete: () => {
          stateRef.current.start = 0
          startLoop()
        },
      })
    } else {
      stateRef.current.start = 0
    }

    recalcChars()
    startLoop()

    const ro = new ResizeObserver(() => {
      recalcChars()
      startLoop()
    })
    ro.observe(wrap)

    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        recalcChars()
        startLoop()
      })
    }

    return () => {
      wrap.removeEventListener('pointerenter', onEnter)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
      for (const { node, onCharEnter } of charHandlers) {
        node.removeEventListener('mouseenter', onCharEnter)
      }
      ro.disconnect()
      powerTweenRef.current?.kill()
      introTweenRef.current?.kill()
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      if (glRef.current) {
        disposeColumnShiftGL(glRef.current)
        glRef.current = null
      }
      split.revert()
    }
  }, [hoverDuration, intro, letterClassName, text])

  return (
    <span
      ref={wrapRef}
      className={cn(
        'relative inline-block overflow-hidden align-top',
        className
      )}
    >
      {/*
        Invisible layout + per-char hit targets. Canvas is the only visible
        paint (reference sites rasterize text once; no HTML text underneath).
        */}
      <span
        ref={textRef}
        aria-hidden="true"
        className="pointer-events-auto select-none whitespace-pre text-transparent"
      >
        {text}
      </span>
      <canvas
        className="pointer-events-none absolute inset-0 z-[1] block h-full w-full"
        ref={canvasRef}
      />
      <span className="sr-only">{text}</span>
    </span>
  )
}
