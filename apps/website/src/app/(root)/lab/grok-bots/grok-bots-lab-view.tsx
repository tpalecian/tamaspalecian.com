'use client'

import { cn } from '@repo/utilities/cn'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import {
  BOT_COLOR_IDS,
  BOT_COLORS,
  BOT_EXPRESSIONS,
  BOT_SHAPES,
  type BotExpression,
  type BotGaze,
  createBot,
  createPrePortfolioCast,
  GrokBot,
} from '@/components/pre-portfolio/grok-bot'

export function GrokBotsLabView() {
  const searchParams = useSearchParams()
  const motionParam = searchParams.get('motion')
  const reducedMotion =
    motionParam === 'full'
      ? false
      : motionParam === 'reduced'
        ? true
        : undefined

  const [spawnKey, setSpawnKey] = useState(0)
  const [speakerId, setSpeakerId] = useState('storyteller')
  const [expression, setExpression] = useState<BotExpression>('talk')

  const cast = useMemo(() => {
    const base = createPrePortfolioCast()
    const speakerIndex = Math.max(
      0,
      base.findIndex((member) => member.id === speakerId)
    )

    return base.map((member, index) => {
      const isSpeaker = member.id === speakerId
      return {
        ...member,
        expression: isSpeaker ? expression : 'idle',
        gaze: gazeToward(index, speakerIndex, isSpeaker, member.gaze),
      }
    })
  }, [expression, speakerId])

  return (
    <main
      className="min-h-dvh bg-white px-gutter py-section-y text-foreground"
      data-lab="grok-bots"
    >
      <p className="text-label text-muted uppercase">Lab</p>
      <h1 className="mt-stack font-semibold text-headline tracking-tight">
        Grok bots
      </h1>
      <p className="mt-stack max-w-prose text-body text-muted">
        Isolated preview of the character factory. Click a face to make them the
        speaker. Talk loops while the expression is talk; the rest idle and look
        over. Use <code className="text-caption">?motion=full</code> or{' '}
        <code className="text-caption">?motion=reduced</code>. Homepage and name
        loader stay untouched.
      </p>

      <div className="mt-stack-lg flex flex-wrap gap-2">
        {BOT_EXPRESSIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={chipClass(expression === value)}
            onClick={() => {
              setExpression(value)
            }}
            data-expression-control={value}
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          className={chipClass(false)}
          onClick={() => {
            setSpawnKey((key) => key + 1)
          }}
        >
          Replay spawn
        </button>
      </div>

      <p
        className="mt-stack font-mono text-caption text-muted"
        data-speaker={speakerId}
        data-cast-expression={expression}
      >
        Speaker: {speakerId} · {expression}
        {reducedMotion === true ? ' · reduced motion' : ''}
        {reducedMotion === false ? ' · full motion' : ''}
      </p>

      <section
        className="mt-stack-xl flex flex-wrap items-end justify-center gap-8 sm:gap-10"
        aria-label="Pre-portfolio cast"
      >
        {cast.map((member) => (
          <button
            key={member.id}
            type="button"
            className="flex flex-col items-center gap-3 rounded-2xl p-2 text-center transition-colors hover:bg-surface-sunken/50"
            onClick={() => {
              setSpeakerId(member.id)
            }}
            aria-pressed={member.id === speakerId}
            data-cast-member={member.id}
          >
            <GrokBot
              character={member}
              reducedMotion={reducedMotion}
              spawnKey={spawnKey}
            />
            <span className="text-caption text-muted">{member.name}</span>
          </button>
        ))}
      </section>

      <section className="mt-section-y border-border-subtle border-t pt-section-y">
        <h2 className="text-label text-muted uppercase">Shapes</h2>
        <ul className="mt-stack-lg grid grid-cols-2 gap-6 sm:grid-cols-4">
          {BOT_SHAPES.map((shape) => (
            <li key={shape} className="flex flex-col items-center gap-2">
              <GrokBot
                character={createBot({
                  id: `shape-${shape}`,
                  name: shape,
                  shape,
                  color: 'ink',
                  size: 88,
                  expression: 'idle',
                })}
                reducedMotion={reducedMotion}
                spawnKey={spawnKey}
              />
              <span className="font-mono text-[10px] text-muted">{shape}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-section-y border-border-subtle border-t pt-section-y">
        <h2 className="text-label text-muted uppercase">Colors</h2>
        <ul className="mt-stack-lg flex flex-wrap items-end justify-center gap-4">
          {BOT_COLOR_IDS.map((color) => (
            <li key={color} className="flex flex-col items-center gap-2">
              <GrokBot
                character={createBot({
                  id: `color-${color}`,
                  name: color,
                  shape: 'circle',
                  color,
                  size: 64,
                  expression: 'idle',
                })}
                reducedMotion={reducedMotion}
                spawnKey={spawnKey}
              />
              <span className="font-mono text-[10px] text-muted">
                {color}
                <span className="block text-[9px]">{BOT_COLORS[color]}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

function gazeToward(
  fromIndex: number,
  toIndex: number,
  isSpeaker: boolean,
  rest: BotGaze
): BotGaze {
  if (isSpeaker) return rest
  const dx = toIndex - fromIndex
  if (dx === 0) return rest
  return {
    x: Math.sign(dx) * 0.62,
    y: 0.08,
  }
}

function chipClass(active: boolean): string {
  return cn(
    'rounded-md border px-3 py-1.5 text-caption transition-colors',
    active
      ? 'border-foreground bg-foreground text-white'
      : 'border-border-subtle bg-surface-elevated hover:bg-surface-sunken'
  )
}
