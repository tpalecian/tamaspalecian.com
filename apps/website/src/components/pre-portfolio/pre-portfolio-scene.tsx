'use client'

import { cn } from '@repo/utilities/cn'
import { useLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
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
import { STORY, type StorySpeakerId, speakersUpTo } from './story'
import { StoryAudio } from './story-audio'
import { StoryTimeline } from './story-timeline'
import { useStoryClock } from './use-story-clock'

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
      html.classList.remove(
        'pre-portfolio-stage',
        'pre-portfolio-lock',
        'pre-portfolio-snap'
      )
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
  const clock = useStoryClock(reduceMotion)
  const { beatIndex, overallProgress, status, goTo, togglePlay, skipToEnd } =
    clock
  const lastBeatRef = useRef(0)
  const [hardCut, setHardCut] = useState(false)
  const botSize = useStageBotSize()
  const castById = useMemo(() => {
    const map = new Map<string, GrokCharacter>()
    for (const member of createPrePortfolioCast()) {
      map.set(member.id, member)
    }
    return map
  }, [])

  useStageScrollLock()

  useLayoutEffect(() => {
    const jumped = Math.abs(beatIndex - lastBeatRef.current) > 1
    setHardCut(jumped)
    lastBeatRef.current = beatIndex
  }, [beatIndex])

  useEffect(() => {
    if (status !== 'playing') {
      StoryAudio.stop()
      return
    }
    const nextBeat = STORY[beatIndex]
    if (!nextBeat) return
    StoryAudio.play(nextBeat)
    return () => {
      StoryAudio.stop()
    }
  }, [beatIndex, status])

  const onSeek = useCallback(
    (index: number) => {
      goTo(index)
    },
    [goTo]
  )

  useEffect(() => {
    const isInteractive = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false
      return Boolean(target.closest('button, a, input, textarea, select'))
    }

    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ': {
          if (isInteractive(event.target)) return
          event.preventDefault()
          togglePlay()
          return
        }
        case 'ArrowLeft':
          event.preventDefault()
          goTo(beatIndex - 1)
          return
        case 'ArrowRight':
          event.preventDefault()
          goTo(beatIndex + 1)
          return
        case 'Escape':
        case 'End':
          event.preventDefault()
          skipToEnd()
          return
        default:
          return
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [beatIndex, goTo, skipToEnd, togglePlay])

  const beat = STORY[beatIndex] ?? STORY[0]
  const visibleIds = speakersUpTo(beatIndex)
  const speakerIndex = visibleIds.indexOf(beat.speaker)
  const talking = status === 'playing'

  return (
    <main
      className={cn(
        'relative min-h-dvh overflow-hidden bg-white text-foreground',
        className
      )}
      data-pre-portfolio-scene=""
      data-story-phase="stage"
      data-story-driver="clock"
      data-beat-id={beat.id}
      data-beat-index={beatIndex}
      data-speaker={beat.speaker}
      data-cast-count={visibleIds.length}
      data-story-status={status}
      data-story-playing={talking ? 'true' : 'false'}
      data-reduced-motion={reduceMotion ? 'true' : 'false'}
    >
      <div className="fixed inset-0 z-overlay flex flex-col overflow-hidden bg-white">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8">
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
                speakerIndex,
                talking
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

        <div className="flex shrink-0 justify-center px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <StoryTimeline
            beatIndex={beatIndex}
            overallProgress={overallProgress}
            status={status}
            reduceMotion={reduceMotion}
            onTogglePlay={togglePlay}
            onSeek={onSeek}
            onSkip={skipToEnd}
          />
        </div>
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
  speakerIndex: number,
  talking: boolean
): GrokCharacter | null {
  if (!base) return null
  const isSpeaker = id === speaker
  return {
    ...base,
    size,
    expression: isSpeaker && talking ? 'talk' : 'idle',
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

function useStageScrollLock() {
  const lenis = useLenis()

  useLayoutEffect(() => {
    const html = document.documentElement
    html.classList.add('pre-portfolio-lock', 'lenis-stopped')
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    if (lenis) {
      lenis.stop()
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }

    const preventScroll = (event: Event) => {
      event.preventDefault()
    }

    const blockKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
    ])

    const preventKeys = (event: KeyboardEvent) => {
      if (blockKeys.has(event.key)) event.preventDefault()
    }

    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    window.addEventListener('keydown', preventKeys, { capture: true })

    return () => {
      html.classList.remove('pre-portfolio-lock', 'lenis-stopped')
      html.style.overflow = ''
      document.body.style.overflow = ''
      lenis?.start()
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      window.removeEventListener('keydown', preventKeys, { capture: true })
    }
  }, [lenis])
}
