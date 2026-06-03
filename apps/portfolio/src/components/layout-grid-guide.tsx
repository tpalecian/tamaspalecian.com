import { cn } from '@repo/shared/cn'
import type { CSSProperties } from 'react'

function columnTrackKey(total: number, offset: number) {
  return `layout-grid-track-${total}-${offset}`
}

type LayoutGridGuideProps = {
  /** Number of vertical tracks (reference site uses 13). */
  columns?: number
  /**
   * Passed to `repeat()` for each column. Default `minmax(0, 1fr)` keeps columns equal-width and fluid.
   * Use e.g. `1rem` for fixed tracks with free space between (reference-style).
   */
  track?: string
  /** CSS color for the dashed line (stops use 50% / 50% like the reference). */
  lineColor?: string
  /** Hide first and last tracks (matches evasanchez.info). */
  hideEdgeTracks?: boolean
  className?: string
  lineClassName?: string
}

export function LayoutGridGuide({
  columns = 13,
  track = 'minmax(0, 1fr)',
  lineColor = 'var(--color-grid-line)',
  hideEdgeTracks = true,
  className,
  lineClassName,
}: LayoutGridGuideProps) {
  const lineStyle = {
    '--layout-grid-line': lineColor,
  } as CSSProperties & { '--layout-grid-line': string }

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-0 z-0 grid h-dvh max-h-dvh w-full opacity-15',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, ${track})`,
      }}
    >
      {Array.from({ length: columns }, (_, columnIndex) => (
        <div
          key={columnTrackKey(columns, columnIndex)}
          className={cn(
            'flex h-full min-h-0 min-w-0 justify-between',
            hideEdgeTracks && columnIndex === 0 && 'invisible opacity-0',
            hideEdgeTracks &&
              columnIndex === columns - 1 &&
              'invisible opacity-0'
          )}
        >
          <span
            className={cn(
              'block h-full w-px shrink-0 bg-[length:100%_8px] bg-[linear-gradient(to_bottom,transparent_50%,var(--layout-grid-line)_50%)]',
              lineClassName
            )}
            style={lineStyle}
          />
          <span
            className={cn(
              'block h-full w-px shrink-0 bg-[length:100%_8px] bg-[linear-gradient(to_bottom,transparent_50%,var(--layout-grid-line)_50%)]',
              lineClassName
            )}
            style={lineStyle}
          />
        </div>
      ))}
    </div>
  )
}
