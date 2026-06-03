'use client'

import { cn } from '@repo/utilities/cn'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'
import { IntroTypewriter } from './intro-typewriter'

const SESSION_KEY = 'portfolio-intro-seen'

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
      return
    }
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setPhase('done')
    }
  }, [prefersReducedMotion])

  const showIntro = phase === 'intro' || phase === 'reveal'

  useEffect(() => {
    if (showIntro) {
      document.documentElement.classList.add('lenis-stopped')
      return () => {
        document.documentElement.classList.remove('lenis-stopped')
      }
    }
    document.documentElement.classList.remove('lenis-stopped')
  }, [showIntro])

  const handleTypewriterComplete = useCallback(() => {
    setPhase('reveal')
  }, [])

  const finishIntro = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setPhase('done')
  }, [])

  const skipIntro = useCallback(() => {
    finishIntro()
  }, [finishIntro])

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className="relative"
        initial={false}
        animate={
          phase === 'done' || phase === 'reveal'
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: 32, filter: 'blur(8px)' }
        }
        transition={{
          duration: prefersReducedMotion ? 0 : 0.85,
          ease: [0.22, 1, 0.36, 1],
          delay: phase === 'reveal' ? 0.2 : 0,
        }}
      >
        {children}
      </motion.div>

      <AnimatePresence onExitComplete={finishIntro}>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            className="fixed inset-0 z-overlay flex bg-background will-change-transform"
            initial={{ y: 0 }}
            animate={phase === 'reveal' ? { y: '-100%' } : { y: 0 }}
            exit={{ y: '-100%' }}
            transition={{
              duration: prefersReducedMotion ? 0 : 1.1,
              ease: [0.22, 1, 0.36, 1],
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
                className="max-w-narrow"
                animate={
                  phase === 'reveal'
                    ? { opacity: 0, y: -20, filter: 'blur(6px)' }
                    : { opacity: 1, y: 0, filter: 'blur(0px)' }
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <IntroTypewriter
                  enabled={phase === 'intro' && !prefersReducedMotion}
                  onComplete={handleTypewriterComplete}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
