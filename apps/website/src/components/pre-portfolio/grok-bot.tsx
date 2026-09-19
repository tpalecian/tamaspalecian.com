'use client'

import { cn } from '@repo/utilities/cn'
import {
  MotionConfig,
  motion,
  type TargetAndTransition,
  type Transition,
  useReducedMotion,
} from 'motion/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import {
  botBodyPath,
  botColorHex,
  eyeLayoutFor,
  type GrokCharacter,
} from './grok-bot.ts'

export type GrokBotProps = {
  character: GrokCharacter
  className?: string
  /** When set, overrides `prefers-reduced-motion` (lab preview). */
  reducedMotion?: boolean
  /** Change to replay the spawn squash. */
  spawnKey?: number | string
}

const SPAWN_SPRING: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 16,
  mass: 0.75,
}

const TALK_TRANSITION: Transition = {
  duration: 0.46,
  repeat: Number.POSITIVE_INFINITY,
  ease: [0.37, 0.02, 0.22, 1],
  times: [0, 0.22, 0.5, 0.76, 1],
}

const TALK_BODY = {
  scaleX: [1, 1.12, 0.94, 1.08, 1],
  scaleY: [1, 0.82, 1.08, 0.88, 1],
  rotate: [0, -5.5, 3.2, -2.4, 0],
  y: [0, 5, -1.5, 3.5, 0],
}

const TALK_PORTRAIT = {
  scaleX: [1, 1.05, 0.97, 1.04, 1],
  scaleY: [1, 0.94, 1.04, 0.96, 1],
  rotate: [0, -2.4, 1.6, -1.2, 0],
  y: [0, 3, -0.8, 2, 0],
}

export function GrokBot(props: GrokBotProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduceMotion = props.reducedMotion ?? prefersReducedMotion === true

  return (
    <MotionConfig reducedMotion="never">
      <GrokBotStage {...props} reduceMotion={reduceMotion} />
    </MotionConfig>
  )
}

type GrokBotStageProps = GrokBotProps & {
  reduceMotion: boolean
}

function GrokBotStage({
  character,
  className,
  spawnKey = 0,
  reduceMotion,
}: GrokBotStageProps) {
  const { kind, expression, size, name } = character
  const isTalking = expression === 'talk'
  const [lid, setLid] = useState(1)

  useEffect(() => {
    if (reduceMotion) {
      setLid(1)
      return
    }

    let cancelled = false
    let waitId = 0
    let blinkId = 0

    const schedule = (delay: number) => {
      waitId = window.setTimeout(() => {
        if (cancelled) return
        setLid(0.08)
        blinkId = window.setTimeout(() => {
          if (cancelled) return
          setLid(1)
          const next = 2200 + Math.random() * 2600
          const doubleBlink = Math.random() < 0.18
          schedule(doubleBlink ? 220 : next)
        }, 150)
      }, delay)
    }

    schedule(900 + Math.random() * 1400)

    return () => {
      cancelled = true
      window.clearTimeout(waitId)
      window.clearTimeout(blinkId)
    }
  }, [reduceMotion])

  const spawnInitial = reduceMotion
    ? { opacity: 1, scale: 1, scaleX: 1, scaleY: 1 }
    : { opacity: 0.2, scale: 0.42, scaleX: 0.62, scaleY: 1.28 }

  const spawnAnimate = { opacity: 1, scale: 1, scaleX: 1, scaleY: 1 }
  const motionForBody = bodyMotion(expression, reduceMotion, kind)

  return (
    <motion.div
      key={`${character.id}-${spawnKey}`}
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
      initial={spawnInitial}
      animate={spawnAnimate}
      transition={reduceMotion ? { duration: 0 } : SPAWN_SPRING}
      data-grok-bot=""
      data-character={character.id}
      data-kind={kind}
      data-shape={character.shape}
      data-expression={expression}
      data-talking={isTalking ? 'true' : 'false'}
      data-reduced-motion={reduceMotion ? 'true' : 'false'}
      role="img"
      aria-label={name}
    >
      <motion.div
        className="size-full"
        animate={motionForBody.animate}
        transition={motionForBody.transition}
        style={{ transformOrigin: '50% 70%' }}
      >
        {kind === 'portrait' ? (
          <PortraitFace character={character} />
        ) : (
          <BotFace
            character={character}
            eyeOpen={reduceMotion ? 1 : lid}
            reduceMotion={reduceMotion}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

function bodyMotion(
  expression: GrokCharacter['expression'],
  reduceMotion: boolean,
  kind: GrokCharacter['kind']
): { animate: TargetAndTransition; transition: Transition } {
  if (reduceMotion) {
    switch (expression) {
      case 'talk':
        return {
          animate: { scaleX: 1.04, scaleY: 0.96, rotate: 0, y: 0 },
          transition: { duration: 0 },
        }
      case 'think':
        return {
          animate: { scaleX: 1, scaleY: 1, rotate: -6, y: -1 },
          transition: { duration: 0 },
        }
      case 'oops':
        return {
          animate: { scaleX: 1.05, scaleY: 0.95, rotate: 8, y: 0 },
          transition: { duration: 0 },
        }
      case 'idle':
        return {
          animate: { scaleX: 1, scaleY: 1, rotate: 0, y: 0 },
          transition: { duration: 0 },
        }
      default: {
        const _exhaustive: never = expression
        return _exhaustive
      }
    }
  }

  switch (expression) {
    case 'talk':
      return {
        animate: kind === 'portrait' ? TALK_PORTRAIT : TALK_BODY,
        transition: TALK_TRANSITION,
      }
    case 'think':
      return {
        animate: {
          scaleX: [1, 0.995, 1],
          scaleY: [1, 1.02, 1],
          rotate: -6,
          y: [-1, -2.4, -1],
        },
        transition: {
          duration: 3.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        },
      }
    case 'oops':
      return {
        animate: {
          scaleX: 1.06,
          scaleY: 0.94,
          rotate: [8, 11, 8],
          y: [0, 1.5, 0],
        },
        transition: {
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        },
      }
    case 'idle':
      return {
        animate: {
          scaleX: [1, 0.992, 1],
          scaleY: [1, 1.028, 1],
          rotate: 0,
          y: [0, -1.2, 0],
        },
        transition: {
          duration: 3.4,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        },
      }
    default: {
      const _exhaustive: never = expression
      return _exhaustive
    }
  }
}

function BotFace({
  character,
  eyeOpen,
  reduceMotion,
}: {
  character: GrokCharacter
  eyeOpen: number
  reduceMotion: boolean
}) {
  const layout = eyeLayoutFor(character.expression, character.gaze)
  const fill = botColorHex(character.color)
  const gazeX = layout.gaze.x * 7.5
  const gazeY = layout.gaze.y * 7.5
  const talking = character.expression === 'talk' && !reduceMotion
  const squeeze = talking ? [1, 0.58, 1.06, 0.7, 1] : 1

  return (
    <svg
      viewBox="0 0 100 100"
      className="size-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <path d={botBodyPath(character.shape)} fill={fill} />
      <motion.g
        animate={{ scaleY: squeeze }}
        transition={talking ? TALK_TRANSITION : { duration: 0.16 }}
        style={{ originX: '50px', originY: `${48 + gazeY}px` }}
      >
        <g
          transform={`translate(${50 + gazeX} ${48 + gazeY}) rotate(${layout.tilt})`}
        >
          <CapsuleEye
            x={-layout.split}
            width={layout.width}
            height={layout.height}
            open={eyeOpen * layout.open}
          />
          <CapsuleEye
            x={layout.split}
            width={layout.width}
            height={layout.height}
            open={eyeOpen * layout.open}
          />
        </g>
      </motion.g>
    </svg>
  )
}

function CapsuleEye({
  x,
  width,
  height,
  open,
}: {
  x: number
  width: number
  height: number
  open: number
}) {
  const h = Math.max(1.2, height * open)

  return (
    <rect
      x={x - width / 2}
      y={-h / 2}
      width={width}
      height={h}
      rx={width / 2}
      fill="#fff"
    />
  )
}

function PortraitFace({ character }: { character: GrokCharacter }) {
  return (
    <div className="relative size-full overflow-hidden rounded-full bg-foreground text-white shadow-[0_8px_24px_rgb(22_20_17_/_0.12)]">
      {character.portraitSrc ? (
        <Image
          src={character.portraitSrc}
          alt=""
          fill
          sizes={`${character.size}px`}
          className="object-cover"
        />
      ) : (
        <div
          className="flex size-full items-center justify-center font-semibold tracking-tight"
          style={{ fontSize: character.size * 0.34 }}
          data-portrait-placeholder=""
        >
          TP
        </div>
      )}
    </div>
  )
}
