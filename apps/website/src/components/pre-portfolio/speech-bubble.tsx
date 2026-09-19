'use client'

import { cn } from '@repo/utilities/cn'
import { motion } from 'motion/react'

import { type StorySpeakerId, speakerLabel } from './story'

export type SpeechBubbleProps = {
  speaker: StorySpeakerId
  line: string
  className?: string
  reducedMotion?: boolean
}

export function SpeechBubble({
  speaker,
  line,
  className,
  reducedMotion = false,
}: SpeechBubbleProps) {
  return (
    <motion.p
      key={`${speaker}-${line}`}
      role="status"
      aria-live="polite"
      data-speech-bubble=""
      data-speaker={speaker}
      initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.22 }}
      className={cn(
        'inline-block max-w-[min(92vw,32rem)] text-pretty rounded-[1.75rem] bg-black px-5 py-3 text-center font-medium text-[0.9375rem] text-white leading-snug',
        className
      )}
    >
      <span className="sr-only">{speakerLabel(speaker)}: </span>
      {line}
    </motion.p>
  )
}
