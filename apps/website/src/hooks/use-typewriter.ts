'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TypewriterLine = {
  text: string
  /** Pause after this line finishes (ms). */
  pauseAfter?: number
}

type UseTypewriterOptions = {
  lines: TypewriterLine[]
  /** Delay between characters (ms). */
  charDelay?: number
  /** Pause before starting (ms). */
  startDelay?: number
  /** When false, all lines render immediately. */
  enabled?: boolean
  onComplete?: () => void
}

type UseTypewriterResult = {
  /** Currently visible text per line. */
  displayLines: string[]
  /** Index of the line currently being typed, or -1 when idle/done. */
  activeLineIndex: number
  isComplete: boolean
  isTyping: boolean
}

export function useTypewriter({
  lines,
  charDelay = 58,
  startDelay = 320,
  enabled = true,
  onComplete,
}: UseTypewriterOptions): UseTypewriterResult {
  const [displayLines, setDisplayLines] = useState<string[]>(() =>
    enabled ? lines.map(() => '') : lines.map((l) => l.text)
  )
  const [activeLineIndex, setActiveLineIndex] = useState(enabled ? 0 : -1)
  const [isComplete, setIsComplete] = useState(!enabled)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const reset = useCallback(() => {
    if (!enabled) {
      setDisplayLines(lines.map((l) => l.text))
      setActiveLineIndex(-1)
      setIsComplete(true)
      return
    }
    setDisplayLines(lines.map(() => ''))
    setActiveLineIndex(0)
    setIsComplete(false)
  }, [enabled, lines])

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (!enabled || isComplete) {
      return
    }

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    const schedule = (fn: () => void, delay: number) => {
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          fn()
        }
      }, delay)
    }

    const finish = () => {
      setActiveLineIndex(-1)
      setIsComplete(true)
      onCompleteRef.current?.()
    }

    const typeLine = (lineIndex: number, charIndex: number) => {
      if (cancelled) {
        return
      }

      const line = lines[lineIndex]
      if (!line) {
        finish()
        return
      }

      setActiveLineIndex(lineIndex)
      setDisplayLines((prev) => {
        const next = [...prev]
        next[lineIndex] = line.text.slice(0, charIndex + 1)
        return next
      })

      const nextCharIndex = charIndex + 1
      if (nextCharIndex < line.text.length) {
        schedule(() => typeLine(lineIndex, nextCharIndex), charDelay)
        return
      }

      const pauseAfter = line.pauseAfter ?? 420
      const nextLineIndex = lineIndex + 1
      if (nextLineIndex >= lines.length) {
        schedule(finish, pauseAfter)
        return
      }

      schedule(() => typeLine(nextLineIndex, 0), pauseAfter)
    }

    schedule(() => typeLine(0, 0), startDelay)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [charDelay, enabled, isComplete, lines, startDelay])

  return {
    displayLines,
    activeLineIndex,
    isComplete,
    isTyping: enabled && !isComplete,
  }
}
