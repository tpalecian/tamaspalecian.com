'use client'

import { cn } from '@repo/utilities/cn'
import { motion, useReducedMotion } from 'motion/react'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'
import { IntroCopy } from './intro-copy'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const HOLD_AFTER_ENTER_MS = 1200

/** Fully visible. */
const CLIP_OPEN = 'inset(0% 0% 0% 0%)'
/** Clipped from the bottom — wipes upward. */
const CLIP_WIPE_UP = 'inset(0% 0% 100% 0%)'
/** Clipped from the top — text reveals upward on enter. */
const CLIP_MASKED = 'inset(100% 0% 0% 0%)'

type PageIntroPhase = 'intro' | 'reveal' | 'done'

type PageIntroProps = {
  children: ReactNode
  className?: string
}

export function PageIntro({ children, className }: PageIntroProps) {
  const prefersReducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<PageIntroPhase>('intro')

  useLayoutEffect(() => {
    if (prefersReducedMotion) {
      setPhase('done')
    }
  }, [prefersReducedMotion])

  const showOverlay = phase === 'intro' || phase === 'reveal'
  const motionDisabled = prefersReducedMotion

  useEffect(() => {
    if (showOverlay) {
      document.documentElement.classList.add('lenis-stopped')
      return () => {
        document.documentElement.classList.remove('lenis-stopped')
      }
    }
    document.documentElement.classList.remove('lenis-stopped')
  }, [showOverlay])

  useEffect(() => {
    if (phase !== 'intro' || motionDisabled) {
      return
    }

    const enterDurationMs = 900
    const timer = setTimeout(
      () => setPhase('reveal'),
      enterDurationMs + HOLD_AFTER_ENTER_MS
    )

    return () => clearTimeout(timer)
  }, [phase, motionDisabled])

  const finishIntro = useCallback(() => {
    setPhase('done')
  }, [])

  const skipIntro = useCallback(() => {
    finishIntro()
  }, [finishIntro])

  return (
    <div className={cn('relative', className)}>
      <div className="relative">{children}</div>

      {showOverlay && (
        <motion.div
          className="fixed inset-0 z-overlay flex bg-background will-change-[clip-path]"
          style={{ clipPath: CLIP_OPEN }}
          initial={false}
          animate={{
            clipPath: phase === 'reveal' ? CLIP_WIPE_UP : CLIP_OPEN,
          }}
          transition={{
            duration: motionDisabled ? 0 : 1,
            ease: EASE,
          }}
          onAnimationComplete={() => {
            if (phase === 'reveal') {
              finishIntro()
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Site introduction"
        >
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-default"
            aria-label="Skip introduction"
            onClick={skipIntro}
          />

          <div className="relative z-20 flex w-full items-center px-gutter">
            <motion.div
              className="max-w-narrow will-change-[clip-path,transform,opacity]"
              initial={
                motionDisabled
                  ? false
                  : { opacity: 0, y: 24, clipPath: CLIP_MASKED }
              }
              animate={{
                opacity: 1,
                y: 0,
                clipPath: CLIP_OPEN,
              }}
              transition={{
                duration: motionDisabled ? 0 : 0.8,
                ease: EASE,
                delay: motionDisabled ? 0 : 0.1,
              }}
            >
              <IntroCopy />
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
