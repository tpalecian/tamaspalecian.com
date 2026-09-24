'use client'

import { cn } from '@repo/utilities/cn'
import { useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef } from 'react'

import { BOT_EYE_GLYPHS } from './bot-mark-eyes'
import {
  BOT_MARK_BANG_PATH,
  BOT_MARK_CENTER,
  botMarkGeometry,
  eyeOutlinePath,
} from './bot-mark-geometry'
import { botFrame, thinkingLift } from './bot-mark-motion'
import type {
  BotMarkConfig,
  BotMarkShape,
  BotMarkState,
} from './grok-bot-app-types'

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

type EyeGlyph = readonly (readonly [number, number])[]

function glyphFor(expression: number, eyeIndex: 0 | 1): EyeGlyph {
  return (
    BOT_EYE_GLYPHS[expression]?.[eyeIndex] ??
    BOT_EYE_GLYPHS[0]?.[eyeIndex] ??
    []
  )
}

function mixGlyphs(
  from: EyeGlyph,
  to: EyeGlyph,
  mix: number
): readonly [number, number][] {
  if (mix <= 0 || from.length !== to.length)
    return from.map((point) => [point[0], point[1]])
  return from.map((point, index) => {
    const next = to[index] ?? point
    return [
      point[0] + (next[0] - point[0]) * mix,
      point[1] + (next[1] - point[1]) * mix,
    ]
  })
}

function restingEyePath(shape: BotMarkShape, eyeIndex: 0 | 1): string {
  const geometry = botMarkGeometry(shape)
  const anchor = geometry.eyes[eyeIndex]
  const glyph = glyphFor(0, eyeIndex)
  return eyeOutlinePath(glyph, anchor, 1, 1, 0, 0)
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
  const geometry = botMarkGeometry(shape)
  const bodyRef = useRef<SVGGElement>(null)
  const leftEyeRef = useRef<SVGPathElement>(null)
  const rightEyeRef = useRef<SVGPathElement>(null)
  const bangRef = useRef<SVGPathElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const reduced = reducedMotion ?? prefersReducedMotion === true

  useEffect(() => {
    const body = bodyRef.current
    const leftEye = leftEyeRef.current
    const rightEye = rightEyeRef.current
    const bang = bangRef.current
    if (!body || !leftEye || !rightEye || !bang) return

    const anchors = geometry.eyes
    const eyes = [leftEye, rightEye]
    let gazeX = 0
    let gazeY = 0

    const draw = (seconds: number) => {
      const frame = botFrame(state, seconds, reduced)
      gazeX += (frame.gazeX - gazeX) * (reduced ? 1 : 0.08)
      gazeY += (frame.gazeY - gazeY) * (reduced ? 1 : 0.08)
      body.setAttribute(
        'transform',
        `translate(${BOT_MARK_CENTER + frame.x} ${BOT_MARK_CENTER + frame.y}) rotate(${frame.rotate}) scale(1 ${frame.scaleY}) translate(${-BOT_MARK_CENTER} ${-BOT_MARK_CENTER})`
      )

      for (let index = 0; index < eyes.length; index++) {
        const eye = eyes[index]
        const anchor = anchors[index]
        if (!eye || !anchor) continue
        const eyeIndex = index === 0 ? 0 : 1
        const glyph = mixGlyphs(
          glyphFor(frame.expression, eyeIndex),
          glyphFor(frame.expressionNext, eyeIndex),
          frame.expressionMix
        )
        const dot = frame.thinking
        const pulse = dot > 0 ? thinkingLift(seconds, index) : 0
        const scale =
          frame.eyeScale *
          (dot > 0 ? 1 - dot * 0.78 : 1) *
          (1 + pulse * 0.04 * dot)
        const shiftX = Math.min(8, Math.max(-8, gazeX * anchor.scale * 0.45))
        const shiftY = Math.min(8, Math.max(-8, gazeY * anchor.scale * 0.45))
        eye.setAttribute(
          'd',
          eyeOutlinePath(
            glyph,
            anchor,
            scale,
            scale * frame.eyeOpen,
            shiftX,
            shiftY - pulse * dot
          )
        )
      }

      if (frame.bang <= 0) {
        bang.setAttribute('display', 'none')
      } else {
        const phase = seconds % 2.2
        const shake = Math.exp(-phase * 5.5) * Math.sin(42 * seconds) * 2.2
        const drop = reduced
          ? -26
          : -26 - (1 - Math.min(1, seconds / 0.28)) * 70
        bang.setAttribute('display', '')
        bang.setAttribute(
          'transform',
          `translate(0 ${drop.toFixed(2)}) rotate(${shake.toFixed(2)} ${BOT_MARK_CENTER} 40.3)`
        )
      }
    }

    draw(0)
    if (reduced) return

    let frameId = 0
    const started = performance.now()
    const tick = (now: number) => {
      draw((now - started) / 1000)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [geometry, reduced, state])

  return (
    <span
      aria-hidden
      className={cn('inline-block overflow-visible', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="-15 -15 259 259"
        width={size}
        height={size}
        aria-hidden
        data-state={state}
        className="block overflow-visible"
      >
        <defs>
          <clipPath id={clipPathId}>
            <path d={geometry.path} />
          </clipPath>
        </defs>
        <g ref={bodyRef}>
          <g
            transform={`translate(${BOT_MARK_CENTER} ${BOT_MARK_CENTER}) scale(${geometry.scale}) translate(${-BOT_MARK_CENTER} ${-BOT_MARK_CENTER})`}
          >
            <path d={geometry.path} fill={color} />
            <g clipPath={`url(#${clipPathId})`}>
              <path ref={leftEyeRef} d={restingEyePath(shape, 0)} fill="#fff" />
              <path
                ref={rightEyeRef}
                d={restingEyePath(shape, 1)}
                fill="#fff"
              />
            </g>
            <path
              ref={bangRef}
              d={BOT_MARK_BANG_PATH}
              fill="#fff"
              display="none"
            />
          </g>
        </g>
      </svg>
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
