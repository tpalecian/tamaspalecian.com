'use client'

import { cn } from '@repo/utilities/cn'
import { useTypewriter } from '@/hooks/use-typewriter'

const INTRO_LINES = [
  { text: 'Tamas Palecian', pauseAfter: 480 },
  { text: '—Technical Lead', pauseAfter: 720 },
] as const

type IntroTypewriterProps = {
  enabled?: boolean
  onComplete?: () => void
  className?: string
}

export function IntroTypewriter({
  enabled = true,
  onComplete,
  className,
}: IntroTypewriterProps) {
  const { displayLines, activeLineIndex, isTyping } = useTypewriter({
    lines: [...INTRO_LINES],
    enabled,
    onComplete,
  })

  return (
    <div
      className={cn(
        'font-regular font-sans text-muted-foreground text-title leading-snug tracking-tight',
        className
      )}
      aria-live="polite"
      aria-busy={isTyping}
    >
      {INTRO_LINES.map((line, index) => (
        <p key={line.text} className={index === 0 ? undefined : 'mt-1'}>
          <span>{displayLines[index]}</span>
          {activeLineIndex === index && (
            <span
              className="ml-px inline-block w-[2px] animate-pulse bg-muted-foreground align-[-0.05em]"
              aria-hidden
            />
          )}
        </p>
      ))}
    </div>
  )
}
