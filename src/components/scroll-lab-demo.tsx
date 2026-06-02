'use client'

import { useLenis } from 'lenis/react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import Link from 'next/link'
import { useRef } from 'react'

import { cn } from '@/library/cn'

const sections = [
  { id: 'intro', label: 'Intro', className: 'bg-stone-100' },
  { id: 'mid', label: 'Mid (jump target)', className: 'bg-stone-200' },
  { id: 'parallax', label: 'Parallax', className: 'bg-stone-300' },
  { id: 'finale', label: 'Finale', className: 'bg-stone-400 text-stone-900' },
] as const

export function ScrollLabDemo() {
  const reduceMotion = useReducedMotion()
  const lenis = useLenis()

  const { scrollYProgress } = useScroll()

  const parallaxRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: parallaxProgress } = useScroll({
    target: parallaxRef,
    offset: ['start end', 'end start'],
  })

  const parallaxY = useTransform(
    parallaxProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [48, -48]
  )

  return (
    <div className="relative min-h-dvh bg-stone-50 text-stone-800">
      <motion.div
        aria-hidden
        className="fixed top-0 right-0 left-0 z-50 h-1 origin-left bg-amber-600"
        style={{ scaleX: scrollYProgress }}
      />

      <header className="sticky top-0 z-40 border-stone-200/80 border-b bg-stone-50/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-medium text-sm text-stone-500">Dev</p>
            <h1 className="font-semibold text-lg tracking-tight">Scroll lab</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-stone-900 px-3 py-1.5 font-medium text-sm text-stone-50 transition hover:bg-stone-800"
              onClick={() => lenis?.scrollTo('#mid', { duration: 1.2 })}
            >
              Lenis → #mid
            </button>
            <Link
              href="/"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-medium text-sm transition hover:bg-stone-100"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-32">
        <p className="text-pretty pt-8 text-stone-600 leading-relaxed">
          Smooth scroll is handled by{' '}
          <span className="font-medium text-stone-800">Lenis</span> on Motion’s
          frame loop. The amber bar is{' '}
          <span className="font-medium text-stone-800">scrollYProgress</span>{' '}
          from <span className="font-medium text-stone-800">motion/react</span>.
          Scroll through the blocks and watch the parallax band in the third
          section.
        </p>

        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="rounded-full border border-stone-300 bg-white px-3 py-1 font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
                onClick={() => lenis?.scrollTo(`#${s.id}`, { duration: 1 })}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-col gap-24">
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className={cn(
                'scroll-mt-28 rounded-2xl border border-stone-200/80 p-10 shadow-sm',
                s.className
              )}
            >
              <h2 className="font-semibold text-2xl tracking-tight">
                {s.label}
              </h2>
              <p className="mt-3 max-w-prose text-pretty text-stone-700 leading-relaxed">
                {s.id === 'intro' &&
                  'Wheel / trackpad here should feel smoothed. The progress line at the very top fills as you move down the page.'}
                {s.id === 'mid' &&
                  'You can land here with the header button or the pill above. This checks Lenis.scrollTo with a hash target.'}
                {s.id === 'parallax' && (
                  <>
                    Below, inner copy moves on a different curve than the page,
                    driven by{' '}
                    <code className="rounded bg-black/10 px-1 py-0.5 text-sm">
                      useScroll
                    </code>{' '}
                    +{' '}
                    <code className="rounded bg-black/10 px-1 py-0.5 text-sm">
                      useTransform
                    </code>
                    .
                  </>
                )}
                {s.id === 'finale' &&
                  'End of the track. Scroll back up: the progress bar and parallax should stay in sync with Lenis.'}
              </p>

              {s.id === 'parallax' ? (
                <div
                  ref={parallaxRef}
                  className="relative mt-8 h-40 overflow-hidden rounded-xl border border-stone-400/40 bg-stone-500/10"
                >
                  <motion.div
                    className="flex h-full items-center justify-center px-6 text-center font-medium text-stone-700"
                    style={{ y: parallaxY }}
                  >
                    Parallax layer — should drift while this band crosses the
                    viewport
                  </motion.div>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
