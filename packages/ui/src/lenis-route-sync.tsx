'use client'

import type { LenisRef } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect } from 'react'

type LenisRouteSyncProps = {
  lenisRef: React.RefObject<LenisRef | null>
}

function LenisRouteSyncInner({ lenisRef }: LenisRouteSyncProps) {
  const pathname = usePathname()

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname re-runs resize on navigation
  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    lenis.resize()

    const resize = () => lenis.resize()
    const observer = new ResizeObserver(resize)
    observer.observe(document.documentElement)

    return () => observer.disconnect()
  }, [pathname, lenisRef])

  return null
}

/** Recalculate Lenis scroll metrics after navigation. */
export function LenisRouteSync({ lenisRef }: LenisRouteSyncProps) {
  return (
    <Suspense fallback={null}>
      <LenisRouteSyncInner lenisRef={lenisRef} />
    </Suspense>
  )
}
