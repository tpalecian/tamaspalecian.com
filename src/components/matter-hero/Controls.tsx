import { useEffect, useRef } from 'react'
import { Pane } from 'tweakpane'

import { useControls } from '@/components/matter-hero/use-controls'

export default function Controls() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { state, dispatch } = useControls()

  useEffect(() => {
    if (!containerRef.current) return

    const pane = new Pane({ container: containerRef.current })

    pane
      .addBinding(state, 'blockCount', { min: 1, max: 100, step: 1 })
      .on('change', (ev) => {
        dispatch({ type: 'SET_BLOCK_COUNT', payload: ev.value })
      })
    pane
      .addBinding(state, 'x', { min: -1, max: 1, step: 0.01 })
      .on('change', (ev) => {
        dispatch({ type: 'SET_X', payload: ev.value })
      })
    pane
      .addBinding(state, 'y', { min: -1, max: 1, step: 0.01 })
      .on('change', (ev) => {
        dispatch({ type: 'SET_Y', payload: ev.value })
      })

    return () => pane.dispose()
  }, [state, dispatch])

  return <div ref={containerRef} className="absolute top-0 right-0" />
}
