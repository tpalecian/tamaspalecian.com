'use client'

import { cn } from '@repo/utilities/cn'
import {
  MotionConfig,
  motion,
  type Transition,
  useReducedMotion,
} from 'motion/react'
import { useEffect, useId, useState } from 'react'

import {
  BOT_MARK_EYE_PATHS,
  BOT_MARK_HEAD_PATHS,
  botMarkEyeOffset,
} from './bot-mark-paths'
import type {
  BotMarkConfig,
  BotMarkShape,
  BotMarkState,
} from './grok-bot-app-types'

const MotionG = motion.create('g')

const MARK_TRANSFORM =
  'translate(114.2705 114.2705) scale(1.0405) translate(-114.2705 -114.2705)'

const STACK_SLOTS = [
  { left: 7, top: 0, zIndex: 1 },
  { left: 0, top: 14, zIndex: 2 },
  { left: 14, top: 14, zIndex: 3 },
] as const

const NOD_EASE = [0.22, 1, 0.36, 1] as const
const WORK_EASE = [0.37, 0.02, 0.22, 1] as const
const WAITING_DURATION = 2.6
const STILL_TRANSITION: Transition = { duration: 0 }

const REST_POSE = {
  x: 0,
  y: 0,
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
}

type BodyChannel = number | number[]

type BodyTarget = {
  x: BodyChannel
  y: BodyChannel
  rotate: BodyChannel
  scaleX: BodyChannel
  scaleY: BodyChannel
}

type BodyMotion = {
  animate: BodyTarget
  transition: Transition
}

type BotMarkProps = {
  color: string
  shape: BotMarkShape
  size?: number
  className?: string
  state?: BotMarkState
  reducedMotion?: boolean
}

type BotMarkStackProps = {
  group: BotMarkConfig[]
  size?: number
  className?: string
  state?: BotMarkState
}

type AgentAvatarProps = {
  agent: BotMarkConfig & { group?: BotMarkConfig[] }
  size: number
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function channelStart(channel: BodyChannel): number {
  return typeof channel === 'number' ? channel : channel[0]
}

function poseStart(target: BodyTarget): BodyTarget {
  return {
    x: channelStart(target.x),
    y: channelStart(target.y),
    rotate: channelStart(target.rotate),
    scaleX: channelStart(target.scaleX),
    scaleY: channelStart(target.scaleY),
  }
}

/**
 * First blink after 0.9–2.4s, held for 120ms, then every 2.2–4.8s.
 * 18% of blinks are followed by a second blink 180ms later.
 */
function useEyeBlink(reduced: boolean): boolean {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (reduced) {
      setBlink(false)
      return
    }

    let cancelled = false
    const timeouts: Array<ReturnType<typeof setTimeout>> = []

    const later = (ms: number, run: () => void) => {
      const id = setTimeout(() => {
        if (!cancelled) run()
      }, ms)
      timeouts.push(id)
    }

    const schedule = (delay: number) => {
      later(delay, () => {
        setBlink(true)
        later(120, () => {
          setBlink(false)
          const queueNext = () => {
            schedule(randomBetween(2200, 4800))
          }
          if (Math.random() < 0.18) {
            later(180, () => {
              setBlink(true)
              later(120, () => {
                setBlink(false)
                queueNext()
              })
            })
          } else {
            queueNext()
          }
        })
      })
    }

    schedule(randomBetween(900, 2400))

    return () => {
      cancelled = true
      for (const id of timeouts) clearTimeout(id)
    }
  }, [reduced])

  return reduced ? false : blink
}

function reducedPose(state: BotMarkState): BodyTarget {
  switch (state) {
    case 'idle':
      return REST_POSE
    case 'acknowledge':
      return { ...REST_POSE, rotate: 2 }
    case 'thinking':
      return { ...REST_POSE, rotate: -9, y: -3 }
    case 'working':
      return { ...REST_POSE, scaleX: 1.06, scaleY: 0.94 }
    case 'waiting':
      return { ...REST_POSE, rotate: -6 }
    case 'blocked':
      return { ...REST_POSE, rotate: 8, scaleX: 1.08, scaleY: 0.9 }
    case 'done':
      return REST_POSE
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}

function bodyMotion(state: BotMarkState, reduced: boolean): BodyMotion {
  if (reduced) {
    return { animate: reducedPose(state), transition: STILL_TRANSITION }
  }

  switch (state) {
    case 'idle':
      return {
        animate: {
          x: 0,
          y: [0, -1.5, 0.4, 0],
          rotate: [0, -2.4, 1.6, 0],
          scaleX: [1, 0.985, 1.012, 1],
          scaleY: [1, 1.04, 0.99, 1],
        },
        transition: { duration: 3.6, ease: 'easeInOut', repeat: Infinity },
      }
    case 'acknowledge':
      return {
        animate: {
          x: 0,
          y: [0, 5, -2, 0],
          rotate: [0, 10, -3, 2],
          scaleX: [1, 1.1, 0.98, 1],
          scaleY: [1, 0.86, 1.06, 1],
        },
        transition: {
          duration: 0.7,
          ease: NOD_EASE,
          times: [0, 0.35, 0.7, 1],
        },
      }
    case 'thinking':
      return {
        animate: {
          x: 0,
          y: [-2, -5, -2],
          rotate: -9,
          scaleX: [1, 0.99, 1],
          scaleY: [1, 1.045, 1],
        },
        transition: { duration: 2.8, ease: 'easeInOut', repeat: Infinity },
      }
    case 'working':
      return {
        animate: {
          x: 0,
          y: [0, 4, -1, 2, 0],
          rotate: [0, -7, 4.2, -3, 0],
          scaleX: [1, 1.16, 0.9, 1.12, 1],
          scaleY: [1, 0.76, 1.12, 0.84, 1],
        },
        transition: {
          duration: 0.46,
          ease: WORK_EASE,
          times: [0, 0.22, 0.5, 0.76, 1],
          repeat: Infinity,
        },
      }
    case 'waiting':
      return {
        animate: {
          x: [-3, 3, -3],
          y: 0,
          rotate: [-6, 6, -6],
          scaleX: 1,
          scaleY: [1, 1.02, 1],
        },
        transition: {
          duration: WAITING_DURATION,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      }
    case 'blocked':
      return {
        animate: {
          x: 0,
          y: [0, 1, 0, 1, 0],
          rotate: [7, 11, 5, 10, 7],
          scaleX: 1.08,
          scaleY: 0.9,
        },
        transition: { duration: 0.55, repeat: Infinity },
      }
    case 'done':
      return {
        animate: {
          x: 0,
          y: [5, -4, 1, 0, 0],
          rotate: [5, -2, 1, 0, 0],
          scaleX: [1.12, 0.94, 1.04, 1, 1],
          scaleY: [0.84, 1.1, 0.97, 1, 1],
        },
        transition: {
          duration: 1.8,
          ease: 'easeOut',
          times: [0, 0.2, 0.38, 0.55, 1],
          repeat: Infinity,
        },
      }
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}

function eyeSquint(state: BotMarkState): number {
  switch (state) {
    case 'working':
      return 0.72
    case 'done':
      return 0.88
    case 'idle':
    case 'acknowledge':
    case 'thinking':
    case 'waiting':
    case 'blocked':
      return 1
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}

function eyeGaze(state: BotMarkState, reduced: boolean): BodyTarget {
  switch (state) {
    case 'idle':
      return { ...REST_POSE, x: 6, y: -4 }
    case 'acknowledge':
      return { ...REST_POSE, x: 0, y: 6 }
    case 'thinking':
      return { ...REST_POSE, x: -4, y: -16 }
    case 'working':
      return { ...REST_POSE, x: 0, y: 2 }
    case 'waiting':
      if (reduced) return { ...REST_POSE, x: -14, y: 0 }
      return { ...REST_POSE, x: [-14, 14, -14], y: 0 }
    case 'blocked':
      return { ...REST_POSE, x: 10, y: -10 }
    case 'done':
      return { ...REST_POSE, x: 0, y: 2 }
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}

function eyeTransition(
  state: BotMarkState,
  reduced: boolean,
  blink: boolean
): Transition {
  const duration = blink ? 0.07 : 0.35
  if (state === 'waiting' && !reduced) {
    return {
      x: {
        duration: WAITING_DURATION,
        ease: 'easeInOut',
        repeat: Infinity,
      },
      y: { duration },
      scaleY: { duration },
    }
  }
  return { duration }
}

export function BotMark({
  color,
  shape,
  size = 32,
  className,
  state = 'idle',
  reducedMotion,
}: BotMarkProps) {
  const clipPathId = useId().replaceAll(':', '')
  const offset = botMarkEyeOffset(shape)
  const head = BOT_MARK_HEAD_PATHS[shape]
  const prefersReducedMotion = useReducedMotion()
  const reduced = reducedMotion ?? prefersReducedMotion === true
  const blink = useEyeBlink(reduced)
  const body = bodyMotion(state, reduced)
  const gaze = eyeGaze(state, reduced)
  const squint = eyeSquint(state)
  const eyeScaleY = blink ? 0.08 : squint

  return (
    <span
      aria-hidden
      className={cn('inline-block overflow-visible', className)}
      style={{ width: size, height: size }}
    >
      <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
        <motion.span
          key={state}
          data-state={state}
          className="block h-full w-full"
          style={{ transformOrigin: '50% 70%' }}
          initial={poseStart(body.animate)}
          animate={body.animate}
          transition={body.transition}
        >
          <svg
            viewBox="-15 -15 259 259"
            width={size}
            height={size}
            aria-hidden
            className="block overflow-visible"
          >
            <defs>
              <clipPath id={clipPathId}>
                <path d={head} />
              </clipPath>
            </defs>
            <g transform={MARK_TRANSFORM}>
              <path d={head} fill={color} />
              <g
                clipPath={`url(#${clipPathId})`}
                transform={`translate(${offset.x} ${offset.y})`}
              >
                <MotionG
                  animate={{ scaleY: eyeScaleY, x: gaze.x, y: gaze.y }}
                  initial={{
                    scaleY: squint,
                    x: channelStart(gaze.x),
                    y: channelStart(gaze.y),
                  }}
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                  }}
                  transition={eyeTransition(state, reduced, blink)}
                >
                  <path d={BOT_MARK_EYE_PATHS[0]} fill="#fff" />
                  <path d={BOT_MARK_EYE_PATHS[1]} fill="#fff" />
                </MotionG>
              </g>
            </g>
          </svg>
        </motion.span>
      </MotionConfig>
    </span>
  )
}

export function BotMarkStack({
  group,
  size = 32,
  className,
  state,
}: BotMarkStackProps) {
  const scale = size / 32
  const markSize = 18 * scale

  return (
    <span
      className={cn('relative inline-block', className)}
      style={{ width: size, height: size }}
    >
      {STACK_SLOTS.map((slot, index) => {
        const member = group[index]
        if (!member) return null

        return (
          <span
            key={`${slot.left}-${slot.top}`}
            className="absolute overflow-hidden rounded-full bg-white"
            style={{
              left: slot.left * scale,
              top: slot.top * scale,
              zIndex: slot.zIndex,
              width: markSize,
              height: markSize,
              boxShadow: '0 0 0 2px var(--grok-bot-sidebar-bg, #fff)',
            }}
          >
            <BotMark
              color={member.color}
              shape={member.shape}
              size={markSize}
              className="h-full w-full"
              state={state}
            />
          </span>
        )
      })}
    </span>
  )
}

export function AgentAvatar({ agent, size }: AgentAvatarProps) {
  const state = agent.state ?? 'idle'

  if (agent.group && agent.group.length > 0) {
    return <BotMarkStack group={agent.group} size={size} state={state} />
  }

  return (
    <BotMark
      color={agent.color}
      shape={agent.shape}
      size={size}
      state={state}
    />
  )
}
