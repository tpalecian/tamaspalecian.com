import { cn } from '@repo/utilities/cn'
import type { ReactNode } from 'react'

type IconProps = {
  size?: number
  className?: string
}

type IconGlyphProps = IconProps & {
  children: ReactNode
}

function IconGlyph({ size = 14, className, children }: IconGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('block', className)}
    >
      {children}
    </svg>
  )
}

export function NewAgentIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </IconGlyph>
  )
}

export function SearchIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </IconGlyph>
  )
}

export function ComputerIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4" />
      <path d="M8 20h8" />
    </IconGlyph>
  )
}

export function PlusIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconGlyph>
  )
}

export function SettingsIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <path d="M10.3 3.9a1.7 1.7 0 0 1 3.4 0l.1.7a1.7 1.7 0 0 0 2.5 1.1l.6-.4a1.7 1.7 0 0 1 2.4 2.4l-.4.6a1.7 1.7 0 0 0 1.1 2.5l.7.1a1.7 1.7 0 0 1 0 3.4l-.7.1a1.7 1.7 0 0 0-1.1 2.5l.4.6a1.7 1.7 0 0 1-2.4 2.4l-.6-.4a1.7 1.7 0 0 0-2.5 1.1l-.1.7a1.7 1.7 0 0 1-3.4 0l-.1-.7a1.7 1.7 0 0 0-2.5-1.1l-.6.4a1.7 1.7 0 0 1-2.4-2.4l.4-.6a1.7 1.7 0 0 0-1.1-2.5l-.7-.1a1.7 1.7 0 0 1 0-3.4l.7-.1a1.7 1.7 0 0 0 1.1-2.5l-.4-.6a1.7 1.7 0 0 1 2.4-2.4l.6.4a1.7 1.7 0 0 0 2.5-1.1Z" />
      <circle cx="12" cy="12" r="3" />
    </IconGlyph>
  )
}

export function CloseIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </IconGlyph>
  )
}

export function ChevronLeftIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <path d="m15 5-7 7 7 7" />
    </IconGlyph>
  )
}

export function ClockIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconGlyph>
  )
}

export function MicIcon({ size = 14, className }: IconProps) {
  return (
    <IconGlyph size={size} className={className}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v3" />
      <path d="M8 20h8" />
    </IconGlyph>
  )
}
