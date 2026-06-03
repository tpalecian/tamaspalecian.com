'use client'

import { cn } from '@repo/utilities/cn'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

type ParallaxSectionProps = {
  className?: string
  children?: React.ReactNode
}

/**
 * Scroll-linked parallax using Motion + Lenis (via shared rAF in SmoothScrollProvider).
 */
export function ParallaxSection({ className, children }: ParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.4, 1, 1, 0.4]
  )

  return (
    <section
      ref={ref}
      className={cn('relative overflow-hidden py-24', className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-accent-muted/30 to-transparent"
        style={{ y, opacity }}
        aria-hidden
      />
      {children}
    </section>
  )
}
