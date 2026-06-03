'use client'

import { type LenisRef, ReactLenis } from 'lenis/react'
import { cancelFrame, frame } from 'motion-dom'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useRef } from 'react'

type SmoothScrollProviderProps = {
  children: ReactNode
}

/**
 * Smooth scrolling via Lenis, driven on the same rAF tick as Motion
 * (`useScroll`, `useTransform`, layout animations, etc.) for synced updates.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null)
  const pathname = usePathname()

  useEffect(() => {
    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp)
    }

    frame.update(update, true)

    return () => cancelFrame(update)
  }, [])

  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    lenis.resize()

    const resize = () => lenis.resize()
    const observer = new ResizeObserver(resize)
    observer.observe(document.documentElement)

    return () => observer.disconnect()
  }, [pathname])

  return (
    <ReactLenis ref={lenisRef} root options={{ autoRaf: false }}>
      {children}
    </ReactLenis>
  )
}
