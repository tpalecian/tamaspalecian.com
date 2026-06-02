'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'

import { cn } from '@/library/cn'

type Circle = { kind: 'circle'; cx: number; cy: number; r: number }
type Path = { kind: 'path'; d: string }
type Line = Circle | Path

const lines: Line[] = [
  { kind: 'circle', cx: 1989.62, cy: 1260.96, r: 881.33 },
  { kind: 'circle', cx: -581.02, cy: 1260.96, r: 881.33 },
  { kind: 'circle', cx: 720.13, cy: 1260.96, r: 881.33 },
  { kind: 'path', d: 'M-1280 440 L 2720 440' },
  { kind: 'path', d: 'M7120.13 -1560 V 2440' },
  { kind: 'path', d: 'M1355.73 -1560 V 2440' },
  { kind: 'path', d: 'M70.21 -1560 V 2440' },
  { kind: 'circle', cx: -581.02, cy: -380.41, r: 881.33 },
  { kind: 'circle', cx: 1989.62, cy: -380.41, r: 881.33 },
  { kind: 'circle', cx: 720.13, cy: -380.41, r: 881.33 },
  {
    kind: 'path',
    d: 'M1605.76 685.27 H 1530.05 M1605.76 638.53 V 760.95 M1530.05 638.41 H 1728.33 M1530.05 760.94 V 440.44 M1728.21 760.64 V 440.14 M1209.45 760.94 H 1728.51',
  },
  {
    kind: 'path',
    d: 'M1209.45 760.94C1209.45 675.94 1243.22 594.42 1303.35 534.31C1363.48 474.2 1445.03 440.44 1530.06 440.44M1728.21 638.53C1728.21 585.99 1707.33 535.61 1670.17 498.46C1633.01 461.31 1582.61 440.44 1530.05 440.44M1728.21 638.52C1728.21 670.99 1715.31 702.13 1692.34 725.08C1669.38 748.04 1638.23 760.94 1605.75 760.94C1585.68 760.94 1566.42 752.96 1552.23 738.77C1538.03 724.58 1530.05 705.33 1530.05 685.26M1576.82 674.14C1576.82 675.6 1577.11 677.05 1577.67 678.4C1578.23 679.75 1579.05 680.97 1580.08 682.01C1581.11 683.04 1582.34 683.86 1583.69 684.42C1585.04 684.98 1586.49 685.27 1587.95 685.27M1605.76 667.46C1605.76 669.8 1605.3 672.11 1604.4 674.27C1603.51 676.43 1602.19 678.4 1600.54 680.05C1598.89 681.7 1596.92 683.02 1594.76 683.91C1592.6 684.81 1590.29 685.27 1587.95 685.27M1605.76 667.47C1605.76 663.67 1605.01 659.9 1603.55 656.39C1602.1 652.88 1599.97 649.69 1597.28 647.01C1594.59 644.32 1591.4 642.19 1587.89 640.73C1584.38 639.28 1580.61 638.53 1576.81 638.53M1530.05 685.27C1530.05 672.87 1534.98 660.99 1543.75 652.22C1552.52 643.46 1564.41 638.53 1576.81 638.53',
  },
]

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.15,
    },
  },
}

const stroke: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.3, ease: 'easeOut' },
    },
  },
}

export function GoldenRatioHero({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section
      className={cn(
        'relative h-dvh min-h-dvh w-screen max-w-[100vw] overflow-hidden bg-background',
        className
      )}
    >
      <motion.svg
        viewBox="550 208 340 464"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-visible text-construction-stroke [aspect-ratio:340/464]"
        aria-hidden
        variants={container}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
      >
        <title>Golden ratio animated construction lines</title>

        {lines.map((line, index) => {
          if (line.kind === 'circle') {
            return (
              <motion.circle
                key={`circle-${index.toString()}`}
                cx={line.cx}
                cy={line.cy}
                r={line.r}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                variants={stroke}
              />
            )
          }

          return (
            <motion.path
              key={`path-${index.toString()}`}
              d={line.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              variants={stroke}
            />
          )
        })}
      </motion.svg>
    </section>
  )
}
