'use client'

import { cn } from '@repo/utilities/cn'
import { useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { BotMark } from '@/components/grok-bot-app/bot-mark'
import {
  BOT_MARK_SHAPES,
  BOT_MARK_STATES,
  type BotMarkShape,
  type BotMarkState,
} from '@/components/grok-bot-app/grok-bot-app-types'

const MARK_COLORS = [
  '#54B9A6',
  '#F19D38',
  '#6464EF',
  '#885CF5',
  '#3C82F6',
  '#ED712E',
] as const

const STATE_CAPTIONS = {
  idle: 'Calm sway, with a blink.',
  acknowledge: 'Nods when work arrives.',
  thinking: 'Leans in. The eyes tighten into dots.',
  working: 'Small, quick bounce while it works.',
  waiting: 'Droops and looks aside.',
  blocked: 'Pops an alert and asks for help.',
  done: 'Opens up, bounces, then spins.',
} as const satisfies Record<BotMarkState, string>

const TOUR_INTERVAL_MS = 2400

type MotionChoice = 'reduced' | 'full' | 'system'

function motionChoice(value: string | null): MotionChoice {
  if (value === 'reduced' || value === 'full') return value
  return 'system'
}

function reducedMotionFor(choice: MotionChoice): boolean | undefined {
  switch (choice) {
    case 'reduced':
      return true
    case 'full':
      return false
    case 'system':
      return undefined
    default: {
      const exhaustive: never = choice
      return exhaustive
    }
  }
}

function nextBotState(current: BotMarkState): BotMarkState {
  const index = BOT_MARK_STATES.indexOf(current)
  return BOT_MARK_STATES[(index + 1) % BOT_MARK_STATES.length] ?? 'idle'
}

function chipClass(selected: boolean): string {
  return cn(
    'rounded-md border px-3 py-1.5 text-caption transition-colors',
    selected
      ? 'border-foreground bg-foreground text-background'
      : 'border-border-subtle text-muted hover:bg-surface-elevated'
  )
}

export function GrokBotLabView() {
  const searchParams = useSearchParams()
  const systemReduced = useReducedMotion() === true
  const [state, setState] = useState<BotMarkState>('idle')
  const [shape, setShape] = useState<BotMarkShape>('blob')
  const [color, setColor] = useState('#3C82F6')
  const [tour, setTour] = useState(false)
  const [motionOverride, setMotionOverride] = useState<MotionChoice | null>(
    null
  )

  const choice = motionOverride ?? motionChoice(searchParams.get('motion'))
  const reducedMotion = reducedMotionFor(choice)
  const reducedActive =
    choice === 'reduced' || (choice === 'system' && systemReduced)

  useEffect(() => {
    if (!tour) return
    const timer = window.setInterval(() => {
      setState((current) => nextBotState(current))
    }, TOUR_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [tour])

  return (
    <main className="mx-auto max-w-content px-gutter py-section-y">
      <header className="mb-stack-xl max-w-prose">
        <p className="mb-stack text-label text-muted uppercase">Lab</p>
        <h1 className="font-semibold text-headline tracking-tight">Grok bot</h1>
        <p className="mt-stack text-body-lg text-muted">
          Every avatar state from the Grok Bot lifecycle. The roster on the{' '}
          <Link
            href="/lab/grok-bot-app"
            className="text-accent underline-offset-2 hover:underline"
          >
            bot app
          </Link>{' '}
          uses these same motions.
        </p>
      </header>

      <div className="flex min-h-[360px] flex-col items-center justify-center gap-stack rounded-3xl border border-border-subtle bg-white px-gutter py-stack-lg">
        <div data-lab-bot>
          <BotMark
            color={color}
            reducedMotion={reducedMotion}
            shape={shape}
            size={180}
            state={state}
          />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground text-title capitalize">
            {state}
          </p>
          <p className="mt-1 text-body text-muted">{STATE_CAPTIONS[state]}</p>
        </div>
      </div>

      <div className="mt-stack-xl flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-2">
          {BOT_MARK_STATES.map((markState) => (
            <button
              key={markState}
              type="button"
              aria-pressed={state === markState}
              className={cn(chipClass(state === markState), 'capitalize')}
              onClick={() => setState(markState)}
            >
              {markState}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {BOT_MARK_SHAPES.map((markShape) => (
            <button
              key={markShape}
              type="button"
              aria-pressed={shape === markShape}
              className={cn(chipClass(shape === markShape), 'capitalize')}
              onClick={() => setShape(markShape)}
            >
              {markShape}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {MARK_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={swatch}
              aria-pressed={color === swatch}
              className={cn(
                'size-8 rounded-full border border-border-subtle',
                color === swatch &&
                  'ring-2 ring-foreground ring-offset-2 ring-offset-background'
              )}
              style={{ backgroundColor: swatch }}
              onClick={() => setColor(swatch)}
            />
          ))}
        </div>
        <button
          type="button"
          aria-pressed={reducedActive}
          className={chipClass(reducedActive)}
          onClick={() => setMotionOverride(reducedActive ? 'full' : 'reduced')}
        >
          Reduced motion
        </button>
        <button
          type="button"
          aria-pressed={tour}
          className={chipClass(tour)}
          onClick={() => setTour((current) => !current)}
        >
          {tour ? 'Pause lifecycle' : 'Play lifecycle'}
        </button>
      </div>

      <ul aria-label="All states" className="mt-stack-lg flex flex-wrap gap-3">
        {BOT_MARK_STATES.map((sample) => (
          <li key={sample}>
            <button
              type="button"
              data-state-sample={sample}
              aria-pressed={state === sample}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl px-2 py-2 text-caption capitalize',
                state === sample ? 'text-foreground' : 'text-muted'
              )}
              onClick={() => setState(sample)}
            >
              <BotMark
                color={color}
                reducedMotion={reducedMotion}
                shape={shape}
                size={48}
                state={sample}
              />
              {sample}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
