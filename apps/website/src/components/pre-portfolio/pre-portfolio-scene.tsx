'use client'

import { cn } from '@repo/utilities/cn'
import { useLenis } from 'lenis/react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  type BotGaze,
  createPrePortfolioCast,
  GrokBot,
  type GrokCharacter,
} from './grok-bot.ts'
import { NameLoader } from './name-loader'
import { SpeechBubble } from './speech-bubble'
import {
  LAST_BEAT_INDEX,
  STORY,
  type StorySpeakerId,
  speakersUpTo,
} from './story'
import { StoryAudio } from './story-audio'

export type PrePortfolioSceneProps = {
  className?: string
  /** When set, overrides `prefers-reduced-motion` (tests / lab). */
  reducedMotion?: boolean
}

export function PrePortfolioScene(props: PrePortfolioSceneProps) {
  const prefersReducedMotion = useReducedMotion()
  const [boot, setBoot] = useState(props.reducedMotion !== undefined)
  const [ready, setReady] = useState(false)
  const reduceMotion =
    props.reducedMotion ?? (boot && prefersReducedMotion === true)

  useEffect(() => {
    setBoot(true)
  }, [])

  useLayoutEffect(() => {
    const html = document.documentElement
    html.classList.add('pre-portfolio-stage')
    return () => {
      html.classList.remove('pre-portfolio-stage', 'pre-portfolio-snap')
    }
  }, [])

  if (!boot) {
    return (
      <div
        className="min-h-dvh bg-white"
        data-pre-portfolio-scene=""
        data-story-phase="loading"
        data-reduced-motion="false"
      />
    )
  }

  return (
    <>
      {ready ? null : (
        <NameLoader
          reducedMotion={reduceMotion}
          onComplete={() => {
            setReady(true)
          }}
        />
      )}
      {ready ? (
        <StoryDirector
          className={props.className}
          reduceMotion={reduceMotion}
        />
      ) : (
        <div
          className="min-h-dvh bg-white"
          data-pre-portfolio-scene=""
          data-story-phase="loading"
          data-reduced-motion={reduceMotion ? 'true' : 'false'}
        />
      )}
    </>
  )
}

type StoryDirectorProps = {
  className?: string
  reduceMotion: boolean
}

function StoryDirector({ className, reduceMotion }: StoryDirectorProps) {
  const spacersRef = useRef<HTMLDivElement>(null)
  const beatIndexRef = useRef(0)
  const [beatIndex, setBeatIndex] = useState(0)
  const [hardCut, setHardCut] = useState(false)
  const botSize = useStageBotSize()
  const nativeSnap = useStorySnapHandoff(true)
  const castById = useMemo(() => {
    const map = new Map<string, GrokCharacter>()
    for (const member of createPrePortfolioCast()) {
      map.set(member.id, member)
    }
    return map
  }, [])

  const { scrollYProgress } = useScroll({
    target: spacersRef,
    offset: ['start start', 'end end'],
  })

  const commitBeatIndex = useCallback((next: number) => {
    const clamped = clampBeat(next)
    if (beatIndexRef.current === clamped) return
    beatIndexRef.current = clamped
    setBeatIndex(clamped)
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    commitBeatIndex(Math.round(progress * LAST_BEAT_INDEX))
  })

  useEffect(() => {
    const beat = STORY[beatIndex]
    if (!beat) return
    StoryAudio.play(beat)
    return () => {
      StoryAudio.stop()
    }
  }, [beatIndex])

  const skipToEnd = useCallback(() => {
    StoryAudio.stop()
    setHardCut(true)
    const last = spacersRef.current?.querySelector(
      `[data-beat-index="${LAST_BEAT_INDEX}"]`
    )
    last?.scrollIntoView({ behavior: 'auto', block: 'start' })
    commitBeatIndex(LAST_BEAT_INDEX)
  }, [commitBeatIndex])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        skipToEnd()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [skipToEnd])

  useEffect(() => {
    const onResize = () => {
      const target = spacersRef.current?.querySelector(
        `[data-beat-index="${beatIndexRef.current}"]`
      )
      target?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const beat = STORY[beatIndex] ?? STORY[0]
  const visibleIds = speakersUpTo(beatIndex)
  const speakerIndex = visibleIds.indexOf(beat.speaker)
  const showCue = beatIndex === 0

  return (
    <main
      className={cn('relative bg-white text-foreground', className)}
      data-pre-portfolio-scene=""
      data-story-phase="stage"
      data-beat-id={beat.id}
      data-beat-index={beatIndex}
      data-speaker={beat.speaker}
      data-cast-count={visibleIds.length}
      data-lenis-smooth-wheel={nativeSnap ? 'false' : 'true'}
      data-reduced-motion={reduceMotion ? 'true' : 'false'}
    >
      <div className="fixed inset-0 z-overlay flex touch-pan-y flex-col overflow-x-hidden bg-white">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 py-16 sm:gap-8">
          <div className="flex min-h-16 w-full items-end justify-center">
            <SpeechBubble
              speaker={beat.speaker}
              line={beat.line}
              reducedMotion={reduceMotion || hardCut}
            />
          </div>

          <ul
            className="flex max-w-full flex-wrap items-end justify-center gap-2 sm:gap-5"
            aria-label="Cast"
          >
            {visibleIds.map((id, index) => {
              const member = stagedCharacter(
                castById.get(id),
                id,
                botSize,
                beat.speaker,
                index,
                speakerIndex
              )
              if (!member) return null

              return (
                <li
                  key={id}
                  className="flex flex-col items-center"
                  data-cast-member={id}
                  data-cast-active={id === beat.speaker ? 'true' : 'false'}
                >
                  <GrokBot character={member} reducedMotion={reduceMotion} />
                </li>
              )
            })}
          </ul>
        </div>

        {showCue ? (
          <p
            data-scroll-cue=""
            className={cn(
              'pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-caption text-muted',
              reduceMotion ? '' : 'animate-pulse'
            )}
          >
            Scroll
          </p>
        ) : null}

        <button
          type="button"
          data-story-skip=""
          className="absolute right-6 bottom-20 z-sticky rounded-full border border-border-subtle bg-white px-3 py-1.5 text-caption text-foreground"
          onClick={skipToEnd}
        >
          Skip
        </button>
      </div>

      <div ref={spacersRef} aria-hidden="true">
        {STORY.map((item, index) => (
          <section
            key={item.id}
            className="pre-portfolio-beat"
            data-story-beat={item.id}
            data-beat-index={index}
          />
        ))}
      </div>
    </main>
  )
}

function stagedCharacter(
  base: GrokCharacter | undefined,
  id: StorySpeakerId,
  size: number,
  speaker: StorySpeakerId,
  index: number,
  speakerIndex: number
): GrokCharacter | null {
  if (!base) return null
  const isSpeaker = id === speaker
  return {
    ...base,
    size,
    expression: isSpeaker ? 'talk' : 'idle',
    gaze: gazeTowardSpeaker(index, speakerIndex, isSpeaker, base.gaze),
  }
}

function gazeTowardSpeaker(
  fromIndex: number,
  speakerIndex: number,
  isSpeaker: boolean,
  rest: BotGaze
): BotGaze {
  if (isSpeaker || speakerIndex < 0) return rest
  const dx = speakerIndex - fromIndex
  if (dx === 0) return rest
  return {
    x: Math.sign(dx) * 0.62,
    y: 0.08,
  }
}

function clampBeat(index: number): number {
  if (index < 0) return 0
  if (index > LAST_BEAT_INDEX) return LAST_BEAT_INDEX
  return index
}

function useStageBotSize(): number {
  const [size, setSize] = useState(96)

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      if (width < 400) setSize(52)
      else if (width < 640) setSize(68)
      else if (width < 1024) setSize(88)
      else setSize(112)
    }

    update()
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
    }
  }, [])

  return size
}

function useStorySnapHandoff(active: boolean): boolean {
  const lenis = useLenis()
  const previous = useRef<{
    smoothWheel?: boolean
    syncTouch?: boolean
  }>({})

  useLayoutEffect(() => {
    if (!active) return

    const html = document.documentElement
    html.classList.add('pre-portfolio-snap')

    if (lenis) {
      previous.current = {
        smoothWheel: lenis.options.smoothWheel,
        syncTouch: lenis.options.syncTouch,
      }
      // Native wheel/touch so CSS `scroll-snap-stop: always` can own each beat.
      // Lenis lerp on those gestures is what fights snap.
      lenis.options.smoothWheel = false
      lenis.options.syncTouch = false
    }

    return () => {
      html.classList.remove('pre-portfolio-snap')
      if (!lenis) return
      if (previous.current.smoothWheel !== undefined) {
        lenis.options.smoothWheel = previous.current.smoothWheel
      }
      if (previous.current.syncTouch !== undefined) {
        lenis.options.syncTouch = previous.current.syncTouch
      }
    }
  }, [active, lenis])

  return true
}
