import type { BotMarkState } from './grok-bot-app-types'

const EYE_CYCLE: Record<BotMarkState, readonly number[]> = {
  idle: [0, 8],
  acknowledge: [17, 0],
  thinking: [8, 16, 14, 17, 5],
  working: [7, 16, 11, 10],
  waiting: [4, 22, 0],
  blocked: [3, 21],
  done: [2, 8, 17],
}

const EYE_PERIOD: Record<BotMarkState, number> = {
  idle: 12,
  acknowledge: 8,
  thinking: 2.6,
  working: 2.4,
  waiting: 4.5,
  blocked: 2.6,
  done: 2,
}

const GAZE_PERIOD: Record<BotMarkState, number> = {
  idle: 4,
  acknowledge: 4,
  thinking: 2.1,
  working: 1.8,
  waiting: 4.5,
  blocked: 2.4,
  done: 2,
}

export type BotFrame = {
  x: number
  y: number
  rotate: number
  scaleY: number
  eyeOpen: number
  eyeScale: number
  gazeX: number
  gazeY: number
  thinking: number
  bang: number
  expression: number
  expressionNext: number
  expressionMix: number
}

function unitRandom(seed: number): number {
  let value = (seed + 0x6d2b79f5) >>> 0
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}

function hashSeed(state: BotMarkState, bucket: number): number {
  return (
    state.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) * 131 +
    bucket * 997
  )
}

function gazeTarget(
  state: BotMarkState,
  seconds: number
): { x: number; y: number } {
  const bucket = Math.floor(seconds / GAZE_PERIOD[state])
  const roll = unitRandom(hashSeed(state, bucket))
  const roll2 = unitRandom(hashSeed(state, bucket + 17))
  const sign = roll2 > 0.5 ? 1 : -1
  switch (state) {
    case 'idle':
    case 'acknowledge':
      return { x: 0, y: 0 }
    case 'thinking':
      return {
        x: sign * (0.5 + roll * 0.5) * 15,
        y: -(9 * (0.4 + roll2 * 0.6)),
      }
    case 'working':
      return { x: 15 * (-0.4 + roll * 0.8), y: 9 * (0.4 + roll2 * 0.6) }
    case 'waiting':
      return { x: sign * (0.7 + roll * 0.3) * 15, y: 9 * (0.4 + roll2 * 0.5) }
    case 'blocked':
      return { x: 15 * (-0.4 + roll * 0.8), y: 9 * (-0.3 + roll2 * 0.6) }
    case 'done':
      return { x: 15 * (-0.3 + roll * 0.6), y: -(9 * (0.2 + roll2 * 0.4)) }
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}

function blinkOpen(state: BotMarkState, seconds: number): number {
  switch (state) {
    case 'blocked':
    case 'acknowledge':
      return 1
    case 'idle':
    case 'thinking':
    case 'working':
    case 'waiting':
    case 'done': {
      const period =
        state === 'working'
          ? 4.2
          : state === 'thinking'
            ? 5.2
            : state === 'done'
              ? 3.4
              : state === 'waiting'
                ? 6
                : 8
      const phase = seconds % period
      if (phase < 0.14) return 0.08
      return 1
    }
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}

function idlePose(
  seconds: number
): Pick<BotFrame, 'x' | 'y' | 'rotate' | 'scaleY'> {
  return {
    x: Math.sin(0.27 * seconds),
    y: 1.2 * Math.sin(0.85 * seconds),
    rotate: 1.5 * Math.sin(0.5 * seconds) + 0.6 * Math.sin(0.17 * seconds),
    scaleY: 1 + 0.007 * Math.sin(0.85 * seconds),
  }
}

function expressionAt(
  state: BotMarkState,
  seconds: number
): {
  expression: number
  expressionNext: number
  expressionMix: number
} {
  const cycle = EYE_CYCLE[state]
  const period = EYE_PERIOD[state]
  const index = Math.floor(seconds / period) % cycle.length
  const current = cycle[index] ?? 0
  const next = cycle[(index + 1) % cycle.length] ?? current
  const local = (seconds % period) / period
  const expressionMix = local > 0.82 ? (local - 0.82) / 0.18 : 0
  return { expression: current, expressionNext: next, expressionMix }
}

export function botFrame(
  state: BotMarkState,
  seconds: number,
  reduced: boolean
): BotFrame {
  const time = reduced ? 0 : seconds
  const eyes = expressionAt(state, time)
  const gaze = reduced ? { x: 0, y: 0 } : gazeTarget(state, time)
  const shared = {
    gazeX: gaze.x,
    gazeY: gaze.y,
    thinking: 0,
    bang: 0,
    eyeOpen: reduced ? 1 : blinkOpen(state, time),
    eyeScale: 1,
    ...eyes,
  }

  switch (state) {
    case 'idle':
      return { ...shared, ...idlePose(time) }
    case 'acknowledge': {
      if (time < 0.7) {
        const nod = Math.sin((time / 0.7) * Math.PI)
        return {
          ...shared,
          x: 0,
          y: nod * 12,
          rotate: nod * 8,
          scaleY: 1 - nod * 0.04,
        }
      }
      return { ...shared, ...idlePose(time) }
    }
    case 'thinking':
      return {
        ...shared,
        x: 5 * Math.sin(0.3 * time),
        y: 2.5 * Math.sin(0.6 * time),
        rotate: -9 + 5 * Math.sin(0.35 * time),
        scaleY: 1,
        thinking: reduced ? 1 : Math.min(1, time / 0.35),
        eyeOpen: reduced ? 1 : shared.eyeOpen,
      }
    case 'working': {
      const beat = Math.sin(time * Math.PI * 3.2)
      const rise = Math.max(0, beat)
      return {
        ...shared,
        x: 3,
        y: 1.5 + 3 * rise,
        rotate: 4 + 2.5 * beat,
        scaleY: 1 - 0.02 * rise,
      }
    }
    case 'waiting': {
      const sigh = time % 5.5
      const bump = sigh < 0.6 ? Math.sin((sigh / 0.6) * Math.PI) : 0
      return {
        ...shared,
        x: 4 * Math.sin(0.2 * time),
        y: 5 + 1.5 * Math.sin(0.35 * time) + 3 * bump,
        rotate: -3 + 4 * Math.sin(0.25 * time),
        scaleY: 0.99 + 0.05 * bump,
        eyeOpen: (reduced ? 1 : shared.eyeOpen) * 0.6,
        eyeScale: 0.98,
      }
    }
    case 'blocked':
      return {
        ...shared,
        x: 0,
        y: 0,
        rotate: 0,
        scaleY: 1,
        bang: 1,
        eyeOpen: reduced ? 1.05 : Math.max(shared.eyeOpen, 1.05),
      }
    case 'done': {
      const cycle = time % 6.2
      let spin = 0
      if (!reduced && cycle > 0.14 && cycle < 1.7) {
        const progress = (cycle - 0.14) / 1.56
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - (-2 * progress + 2) ** 2 / 2
        spin = eased * 720
      }
      return {
        ...shared,
        x: 0,
        y: -(2.5 * Math.abs(Math.sin(1.6 * time))),
        rotate: spin,
        scaleY: spin > 0 ? 0.9 : 1,
        eyeOpen: (reduced ? 1 : shared.eyeOpen) * 1.1,
        eyeScale: 1.12,
      }
    }
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}

export function thinkingLift(seconds: number, eyeIndex: number): number {
  const phase = (((seconds / 1.4 + 0.119) % 1) + 1) % 1
  let distance = Math.abs(phase - eyeIndex / 3)
  distance = Math.min(distance, 1 - distance)
  return 9 * Math.exp(-(distance * distance) / 0.045)
}
