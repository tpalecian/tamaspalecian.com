'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Physics } from '@react-three/cannon'
import { Canvas } from '@react-three/fiber'

import { ControlsProvider } from '@/components/matter-hero/use-controls'

const Scene = dynamic(() => import('@/components/matter-hero/Scene'), {
  ssr: false,
})
const Controls = dynamic(() => import('@/components/matter-hero/Controls'), {
  ssr: false,
})

export default function Home() {
  return (
    <ControlsProvider>
      <main className="w-screen h-screen">
        <Canvas>
          <Suspense fallback={null}>
            <Physics>
              <Scene />
            </Physics>
          </Suspense>
        </Canvas>
        <Controls />
      </main>
    </ControlsProvider>
  )
}
