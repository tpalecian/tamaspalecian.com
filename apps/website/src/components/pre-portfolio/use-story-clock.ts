'use client'

import { useAnimationFrame } from 'motion/react'
import { useCallback, useRef, useState } from 'react'

import { beatDurationMs, LAST_BEAT_INDEX, STORY } from './story'

export const TIMELINE_STATUSES = ['playing', 'paused', 'finished'] as const

export type TimelineStatus = (typeof TIMELINE_STATUSES)[number]

export type StoryClock = {
  beatIndex: number
  beatProgress: number
  overallProgress: number
  status: TimelineStatus
  goTo: (index: number, options?: { play?: boolean }) => void
  pause: () => void
  togglePlay: () => void
  skipToEnd: () => void
}

function clampBeat(index: number): number {
  if (index < 0) return 0
  if (index > LAST_BEAT_INDEX) return LAST_BEAT_INDEX
  return index
}

export function useStoryClock(reduceMotion: boolean): StoryClock {
  const [beatIndex, setBeatIndex] = useState(0)
  const [beatProgress, setBeatProgress] = useState(0)
  const [status, setStatus] = useState<TimelineStatus>('playing')

  const beatIndexRef = useRef(0)
  const statusRef = useRef<TimelineStatus>('playing')
  const elapsedRef = useRef(0)
  const lastTsRef = useRef<number | null>(null)
  const reduceRef = useRef(reduceMotion)
  reduceRef.current = reduceMotion

  const durationOf = useCallback((index: number) => {
    const beat = STORY[index]
    return Math.max(1, beatDurationMs(beat?.line ?? '', reduceRef.current))
  }, [])

  const goTo = useCallback(
    (index: number, options?: { play?: boolean }) => {
      const next = clampBeat(index)
      elapsedRef.current = 0
      lastTsRef.current = null
      beatIndexRef.current = next
      setBeatIndex(next)
      setBeatProgress(0)

      if (options?.play === false) {
        statusRef.current = 'paused'
        setStatus('paused')
        return
      }
      if (options?.play === true) {
        statusRef.current = 'playing'
        setStatus('playing')
        return
      }
      if (statusRef.current === 'finished') {
        const nextStatus: TimelineStatus =
          next === LAST_BEAT_INDEX ? 'finished' : 'playing'
        if (nextStatus === 'finished') {
          elapsedRef.current = durationOf(next)
          setBeatProgress(1)
        }
        statusRef.current = nextStatus
        setStatus(nextStatus)
      }
    },
    [durationOf]
  )

  const pause = useCallback(() => {
    if (statusRef.current === 'finished') return
    statusRef.current = 'paused'
    setStatus('paused')
    lastTsRef.current = null
  }, [])

  const togglePlay = useCallback(() => {
    switch (statusRef.current) {
      case 'playing':
        statusRef.current = 'paused'
        setStatus('paused')
        lastTsRef.current = null
        return
      case 'paused':
        statusRef.current = 'playing'
        setStatus('playing')
        return
      case 'finished':
        elapsedRef.current = 0
        lastTsRef.current = null
        beatIndexRef.current = 0
        setBeatIndex(0)
        setBeatProgress(0)
        statusRef.current = 'playing'
        setStatus('playing')
        return
      default: {
        const _exhaustive: never = statusRef.current
        return _exhaustive
      }
    }
  }, [])

  const skipToEnd = useCallback(() => {
    const last = LAST_BEAT_INDEX
    elapsedRef.current = durationOf(last)
    lastTsRef.current = null
    beatIndexRef.current = last
    setBeatIndex(last)
    setBeatProgress(1)
    statusRef.current = 'finished'
    setStatus('finished')
  }, [durationOf])

  useAnimationFrame((time) => {
    if (statusRef.current !== 'playing') {
      lastTsRef.current = null
      return
    }

    const last = lastTsRef.current
    lastTsRef.current = time
    if (last === null) return

    const dt = Math.min(80, Math.max(0, time - last))
    const dur = durationOf(beatIndexRef.current)
    elapsedRef.current += dt

    if (elapsedRef.current >= dur) {
      if (beatIndexRef.current >= LAST_BEAT_INDEX) {
        elapsedRef.current = dur
        setBeatProgress(1)
        statusRef.current = 'finished'
        setStatus('finished')
        return
      }

      elapsedRef.current = 0
      const next = beatIndexRef.current + 1
      beatIndexRef.current = next
      setBeatIndex(next)
      setBeatProgress(0)
      return
    }

    const progress = elapsedRef.current / dur
    setBeatProgress((prev) =>
      Math.abs(prev - progress) > 0.008 ? progress : prev
    )
  })

  return {
    beatIndex,
    beatProgress,
    overallProgress: (beatIndex + beatProgress) / STORY.length,
    status,
    goTo,
    pause,
    togglePlay,
    skipToEnd,
  }
}
