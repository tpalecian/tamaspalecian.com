import { NAME_VIEWBOX_HEIGHT, NAME_VIEWBOX_WIDTH } from './name-path'

type LiquidFillOptions = {
  width?: number
  height?: number
  amplitude?: number
}

function surfaceY(progress: number, height: number, amplitude: number): number {
  const overshoot = amplitude * 2 + 10
  return height + overshoot - progress * (height + overshoot * 2)
}

function waveY(
  x: number,
  width: number,
  baseY: number,
  time: number,
  amplitude: number
): number {
  const t = time * 2.1
  const nx = x / width
  return (
    baseY +
    Math.sin(nx * Math.PI * 4.2 + t) * amplitude +
    Math.sin(nx * Math.PI * 9.5 + t * 1.35) * amplitude * 0.35
  )
}

/** Closed path: rising liquid with a sine surface, in name viewBox units. */
export function createLiquidFillPath(
  progress: number,
  time: number,
  options: LiquidFillOptions = {}
): string {
  const width = options.width ?? NAME_VIEWBOX_WIDTH
  const height = options.height ?? NAME_VIEWBOX_HEIGHT
  const amplitude = options.amplitude ?? 7
  const y = surfaceY(progress, height, amplitude)
  const steps = 48
  let d = `M0 ${height + 24}`

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width
    d += `L${x.toFixed(2)} ${waveY(x, width, y, time, amplitude).toFixed(2)}`
  }

  d += `L${width} ${height + 24}Z`
  return d
}

/** Open wave stroke along the fill meniscus. */
export function createMeniscusPath(
  progress: number,
  time: number,
  options: LiquidFillOptions = {}
): string {
  const width = options.width ?? NAME_VIEWBOX_WIDTH
  const height = options.height ?? NAME_VIEWBOX_HEIGHT
  const amplitude = options.amplitude ?? 7
  const y = surfaceY(progress, height, amplitude)
  const steps = 48
  let d = ''

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width
    const cmd = i === 0 ? 'M' : 'L'
    d += `${cmd}${x.toFixed(2)} ${waveY(x, width, y, time, amplitude).toFixed(2)}`
  }

  return d
}
