'use client'

import 'lenis/dist/lenis.css'
import { type LenisRef, ReactLenis } from 'lenis/react'
import { cancelFrame, frame } from 'motion-dom'
import { type ReactNode, useEffect, useRef } from 'react'
import { LenisRouteSync } from './lenis-route-sync'

type SmoothScrollProviderProps = {
  children: ReactNode
}

/**
 * Lenis smooth scroll on the same rAF tick as Motion (`useScroll`, `useTransform`, etc.).
 * Pattern inspired by darkroomengineering/satus + motion-dom frame sync.
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
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,
        lerp: 0.125,
        anchors: true,
        autoToggle: true,
      }}
    >
      <LenisRouteSync lenisRef={lenisRef} />
      {children}
    </ReactLenis>
  )
}
