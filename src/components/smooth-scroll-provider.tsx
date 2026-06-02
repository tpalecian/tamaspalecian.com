'use client'

import { type LenisRef, ReactLenis } from 'lenis/react'
import { cancelFrame, frame } from 'motion-dom'
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

  useEffect(() => {
    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp)
    }

    frame.update(update, true)

    return () => cancelFrame(update)
  }, [])

  return (
    <ReactLenis ref={lenisRef} root options={{ autoRaf: false }}>
      {children}
    </ReactLenis>
  )
}
