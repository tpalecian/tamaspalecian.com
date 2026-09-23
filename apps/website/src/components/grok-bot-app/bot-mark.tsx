'use client'

import { cn } from '@repo/utilities/cn'
import { useId } from 'react'

import {
  BOT_MARK_EYE_PATHS,
  BOT_MARK_HEAD_PATHS,
  botMarkEyeOffset,
} from './bot-mark-paths'
import type { BotMarkConfig, BotMarkShape } from './grok-bot-app-types'

const MARK_TRANSFORM =
  'translate(114.2705 114.2705) scale(1.0405) translate(-114.2705 -114.2705)'

const STACK_SLOTS = [
  { left: 7, top: 0, zIndex: 1 },
  { left: 0, top: 14, zIndex: 2 },
  { left: 14, top: 14, zIndex: 3 },
] as const

type BotMarkProps = {
  color: string
  shape: BotMarkShape
  size?: number
  className?: string
}

type BotMarkStackProps = {
  group: BotMarkConfig[]
  size?: number
  className?: string
}

type AgentAvatarProps = {
  agent: BotMarkConfig & { group?: BotMarkConfig[] }
  size: number
}

export function BotMark({ color, shape, size = 32, className }: BotMarkProps) {
  const clipPathId = useId().replaceAll(':', '')
  const offset = botMarkEyeOffset(shape)
  const head = BOT_MARK_HEAD_PATHS[shape]

  return (
    <svg
      viewBox="-15 -15 259 259"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn('block', className)}
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
          <path d={BOT_MARK_EYE_PATHS[0]} fill="#fff" />
          <path d={BOT_MARK_EYE_PATHS[1]} fill="#fff" />
        </g>
      </g>
    </svg>
  )
}

export function BotMarkStack({
  group,
  size = 32,
  className,
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
            />
          </span>
        )
      })}
    </span>
  )
}

export function AgentAvatar({ agent, size }: AgentAvatarProps) {
  if (agent.group && agent.group.length > 0) {
    return <BotMarkStack group={agent.group} size={size} />
  }

  return <BotMark color={agent.color} shape={agent.shape} size={size} />
}
