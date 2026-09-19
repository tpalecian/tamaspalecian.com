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
  /** When set, overrides `prefers-reduced-motion` (lab preview). */
  reducedMotion?: boolean
}

function svgId(reactId: string, suffix: string): string {
  return `name-loader-${reactId.replace(/:/g, '')}-${suffix}`
}

export function NameLoader({
  className,
  onComplete,
  reducedMotion: reducedMotionOverride,
}: NameLoaderProps) {
  const reactId = useId()
  const nameClipId = svgId(reactId, 'clip')
  const liquidFilterId = svgId(reactId, 'liquid')
  const dissolveFilterId = svgId(reactId, 'dissolve')

  const prefersReducedMotion = useReducedMotion()
  const reduceMotion = reducedMotionOverride ?? prefersReducedMotion === true
  const lenis = useLenis()
  const fill = useMotionValue(0)
  const dissolve = useMotionValue(0)
  const fillPathRef = useRef<SVGPathElement>(null)
  const meniscusPathRef = useRef<SVGPathElement>(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const [phase, setPhase] = useState<'filling' | 'dissolving' | 'done'>(
    'filling'
  )

  const dissolveScale = useTransform(dissolve, [0, 1], [0, 78])
  const nameOpacity = useTransform(dissolve, [0, 0.15, 1], [1, 1, 0])

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setPhase('done')
    onCompleteRef.current?.()
  }, [])

  useLayoutEffect(() => {
    const html = document.documentElement

    const unlock = () => {
      html.classList.remove('name-loader-lock', 'lenis-stopped')
      html.style.overflow = ''
      document.body.style.overflow = ''
      lenis?.start()
    }

    if (phase === 'done') {
      unlock()
      return
    }

    html.classList.add('name-loader-lock')
    lenis?.stop()

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
      unlock()
    }
  }, [lenis, phase])

  useLayoutEffect(() => {
    let stopped = false
    const controls: Array<{ stop: () => void }> = []
    let fallbackId = 0

    const done = () => {
      if (stopped) return
      finish()
    }

    if (reduceMotion) {
      fill.set(1)
      fillPathRef.current?.setAttribute(
        'd',
        createLiquidFillPath(1, 0, { amplitude: 0 })
      )
      meniscusPathRef.current?.setAttribute('d', '')
      controls.push(
        animate(dissolve, 1, {
          delay: REDUCED_HOLD_S,
          duration: REDUCED_FADE_S,
          ease: 'easeOut',
          onComplete: done,
        })
      )
      fallbackId = window.setTimeout(
        done,
        (REDUCED_HOLD_S + REDUCED_FADE_S) * 1000 + 120
      )
    } else {
      controls.push(
        animate(fill, 1, {
          duration: FILL_DURATION_S,
          ease: [0.42, 0, 0.58, 1],
          onComplete: () => {
            if (stopped) return
            setPhase('dissolving')
            controls.push(
              animate(dissolve, 1, {
                duration: DISSOLVE_DURATION_S,
                ease: [0.4, 0, 1, 1],
                onComplete: done,
              })
            )
          },
        })
      )
      fallbackId = window.setTimeout(
        done,
        (FILL_DURATION_S + DISSOLVE_DURATION_S) * 1000 + 200
      )
    }

    return () => {
      stopped = true
      window.clearTimeout(fallbackId)
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

  const useLiquid = !reduceMotion
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
              d={createLiquidFillPath(useLiquid ? 0 : 1, 0, {
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
