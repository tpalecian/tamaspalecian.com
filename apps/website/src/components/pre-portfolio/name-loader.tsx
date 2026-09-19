'use client'

import { cn } from '@repo/utilities/cn'
import { useLenis } from 'lenis/react'
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'

import { createLiquidFillPath, createMeniscusPath } from './liquid-fill-path'
import {
  NAME_PATH_D,
  NAME_TEXT,
  NAME_VIEWBOX_HEIGHT,
  NAME_VIEWBOX_WIDTH,
} from './name-path'

const FILL_DURATION_S = 3
const DISSOLVE_DURATION_S = 0.8
const REDUCED_HOLD_S = 0.2
const REDUCED_FADE_S = 0.35

export type NameLoaderProps = {
  className?: string
  onComplete?: () => void
}

function svgId(reactId: string, suffix: string): string {
  return `name-loader-${reactId.replace(/:/g, '')}-${suffix}`
}

export function NameLoader({ className, onComplete }: NameLoaderProps) {
  const reactId = useId()
  const nameClipId = svgId(reactId, 'clip')
  const liquidFilterId = svgId(reactId, 'liquid')
  const dissolveFilterId = svgId(reactId, 'dissolve')

  const reduceMotion = useReducedMotion()
  const lenis = useLenis()
  const fill = useMotionValue(0)
  const dissolve = useMotionValue(0)
  const fillPathRef = useRef<SVGPathElement>(null)
  const meniscusPathRef = useRef<SVGPathElement>(null)
  const completedRef = useRef(false)
  const [phase, setPhase] = useState<'filling' | 'dissolving' | 'done'>(
    'filling'
  )

  const dissolveScale = useTransform(dissolve, [0, 1], [0, 78])
  const nameOpacity = useTransform(dissolve, [0, 0.15, 1], [1, 1, 0])

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setPhase('done')
    onComplete?.()
  }, [onComplete])

  useLayoutEffect(() => {
    lenis?.stop()
    const html = document.documentElement
    html.classList.add('lenis-stopped')

    const blockKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      ' ',
    ])

    const preventScroll = (event: Event) => {
      event.preventDefault()
    }

    const preventKeys = (event: KeyboardEvent) => {
      if (blockKeys.has(event.key)) event.preventDefault()
    }

    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    window.addEventListener('keydown', preventKeys, { capture: true })

    return () => {
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      window.removeEventListener('keydown', preventKeys, { capture: true })
      html.classList.remove('lenis-stopped')
      lenis?.start()
    }
  }, [lenis])

  useLayoutEffect(() => {
    if (reduceMotion === null) return

    let cancelled = false
    const controls: Array<{ stop: () => void }> = []

    async function run() {
      if (reduceMotion) {
        fill.set(1)
        fillPathRef.current?.setAttribute(
          'd',
          createLiquidFillPath(1, 0, { amplitude: 0 })
        )
        meniscusPathRef.current?.setAttribute('d', '')
        const fade = animate(dissolve, 1, {
          delay: REDUCED_HOLD_S,
          duration: REDUCED_FADE_S,
          ease: 'easeOut',
        })
        controls.push(fade)
        await fade
        if (!cancelled) finish()
        return
      }

      const fillAnim = animate(fill, 1, {
        duration: FILL_DURATION_S,
        ease: [0.22, 1, 0.36, 1],
      })
      controls.push(fillAnim)
      await fillAnim
      if (cancelled) return

      setPhase('dissolving')
      const dissolveAnim = animate(dissolve, 1, {
        duration: DISSOLVE_DURATION_S,
        ease: [0.4, 0, 1, 1],
      })
      controls.push(dissolveAnim)
      await dissolveAnim
      if (!cancelled) finish()
    }

    void run()

    return () => {
      cancelled = true
      for (const control of controls) control.stop()
    }
  }, [dissolve, fill, finish, reduceMotion])

  useAnimationFrame((time) => {
    if (reduceMotion || phase === 'done') return
    const seconds = time / 1000
    const progress = fill.get()
    fillPathRef.current?.setAttribute(
      'd',
      createLiquidFillPath(progress, seconds)
    )
    meniscusPathRef.current?.setAttribute(
      'd',
      createMeniscusPath(progress, seconds)
    )
  })

  if (phase === 'done') return null

  const useLiquid = reduceMotion !== true
  const viewBox = `0 0 ${NAME_VIEWBOX_WIDTH} ${NAME_VIEWBOX_HEIGHT}`

  return (
    <div
      className={cn(
        'fixed inset-0 z-overlay flex items-center justify-center overflow-hidden bg-white text-foreground',
        className
      )}
      data-name-loader=""
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label={NAME_TEXT}
    >
      <svg
        className="h-auto w-[min(92vw,58rem)]"
        viewBox={viewBox}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={nameClipId} clipPathUnits="userSpaceOnUse">
            <path d={NAME_PATH_D} />
          </clipPath>
          {useLiquid ? (
            <>
              <filter
                id={liquidFilterId}
                x="-12%"
                y="-30%"
                width="124%"
                height="160%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.014 0.045"
                  numOctaves={2}
                  seed={2}
                  result="noise"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur="3.2s"
                    values="0.014 0.045;0.02 0.03;0.014 0.045"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={12}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
              <filter
                id={dissolveFilterId}
                x="-25%"
                y="-40%"
                width="150%"
                height="180%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.055"
                  numOctaves={1}
                  seed={7}
                  result="dissolveNoise"
                />
                <motion.feDisplacementMap
                  in="SourceGraphic"
                  in2="dissolveNoise"
                  scale={dissolveScale}
                  xChannelSelector="R"
                  yChannelSelector="B"
                />
              </filter>
            </>
          ) : null}
        </defs>

        <motion.g
          style={{ opacity: nameOpacity }}
          filter={
            useLiquid && phase === 'dissolving'
              ? `url(#${dissolveFilterId})`
              : undefined
          }
        >
          <path
            d={NAME_PATH_D}
            fill="none"
            className="stroke-foreground/30"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth={1.4}
          />
          <g clipPath={`url(#${nameClipId})`}>
            <path
              ref={fillPathRef}
              d={createLiquidFillPath(0, 0, {
                amplitude: useLiquid ? 7 : 0,
              })}
              className="fill-foreground"
              filter={useLiquid ? `url(#${liquidFilterId})` : undefined}
            />
            {useLiquid ? (
              <path
                ref={meniscusPathRef}
                d={createMeniscusPath(0, 0)}
                fill="none"
                stroke="#fff"
                strokeWidth={1.7}
                strokeLinecap="round"
                opacity={0.55}
              />
            ) : null}
          </g>
        </motion.g>
      </svg>
    </div>
  )
}
