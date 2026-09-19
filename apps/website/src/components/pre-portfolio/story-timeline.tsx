'use client'

import { cn } from '@repo/utilities/cn'
import type { KeyboardEvent, MouseEvent } from 'react'

import { LAST_BEAT_INDEX, STORY, speakerLabel } from './story'
import type { TimelineStatus } from './use-story-clock'

export type StoryTimelineProps = {
  beatIndex: number
  overallProgress: number
  status: TimelineStatus
  reduceMotion?: boolean
  onTogglePlay: () => void
  onSeek: (index: number) => void
  onSkip: () => void
}

export function StoryTimeline({
  beatIndex,
  overallProgress,
  status,
  onTogglePlay,
  onSeek,
  onSkip,
}: StoryTimelineProps) {
  const playing = status === 'playing'
  const label = playLabel(status)

  return (
    <div
      className="flex w-full max-w-[min(92vw,42rem)] items-center gap-2 sm:gap-3"
      data-story-timeline=""
      data-story-status={status}
    >
      <button
        type="button"
        data-story-play=""
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-white text-foreground"
        aria-label={label}
        onClick={onTogglePlay}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className="relative h-8 cursor-pointer"
          data-story-track=""
          role="slider"
          tabIndex={0}
          aria-label="Story timeline"
          aria-valuemin={0}
          aria-valuemax={LAST_BEAT_INDEX}
          aria-valuenow={beatIndex}
          aria-valuetext={`${beatIndex + 1} of ${STORY.length}`}
          onClick={(event) => {
            onSeek(beatIndexFromClick(event))
          }}
          onKeyDown={(event) => {
            handleTrackKey(event, beatIndex, onSeek)
          }}
        >
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-black/10">
            <div
              data-story-progress=""
              className="h-full rounded-full bg-black"
              style={{
                width: `${Math.min(100, Math.max(0, overallProgress * 100))}%`,
              }}
            />
          </div>
          {STORY.map((beat, index) => (
            <button
              key={beat.id}
              type="button"
              data-beat-tick={index}
              aria-label={`${speakerLabel(beat.speaker)}: ${beat.line}`}
              className={cn(
                'absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white',
                index <= beatIndex ? 'bg-black' : 'bg-black/25'
              )}
              style={{ left: `${((index + 0.5) / STORY.length) * 100}%` }}
              onClick={(event) => {
                event.stopPropagation()
                onSeek(index)
              }}
            />
          ))}
        </div>
      </div>

      <p className="hidden shrink-0 font-mono text-[10px] text-muted tabular-nums sm:block">
        {beatIndex + 1}/{STORY.length}
      </p>

      <button
        type="button"
        data-story-skip=""
        className="shrink-0 rounded-full border border-border-subtle bg-white px-3 py-1.5 text-caption text-foreground"
        onClick={onSkip}
      >
        Skip
      </button>
    </div>
  )
}

function beatIndexFromClick(event: MouseEvent<HTMLElement>): number {
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width
  return Math.max(
    0,
    Math.min(LAST_BEAT_INDEX, Math.floor(ratio * STORY.length))
  )
}

function handleTrackKey(
  event: KeyboardEvent<HTMLDivElement>,
  beatIndex: number,
  onSeek: (index: number) => void
) {
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      event.preventDefault()
      event.stopPropagation()
      onSeek(beatIndex - 1)
      return
    case 'ArrowRight':
    case 'ArrowUp':
      event.preventDefault()
      event.stopPropagation()
      onSeek(beatIndex + 1)
      return
    case 'Home':
      event.preventDefault()
      event.stopPropagation()
      onSeek(0)
      return
    default:
      return
  }
}

function playLabel(status: TimelineStatus): string {
  switch (status) {
    case 'playing':
      return 'Pause'
    case 'paused':
      return 'Play'
    case 'finished':
      return 'Replay'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M8 5.2v13.6L19.2 12 8 5.2z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" fill="currentColor" />
    </svg>
  )
}
