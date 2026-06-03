'use client'

import Link from 'next/link'

import { ColumnShiftHoverText } from '@/components/column-shift-hover-text'
import { ColumnShiftHoverWord } from '@/components/column-shift-hover-word'
import { GoldenRatioHero } from '@/components/golden-ratio-hero'
import { LayoutGridGuide } from '@/components/layout-grid-guide'
import { R0ParticleLogo } from '@/components/r0-particle-logo'
import { cn } from '@/library/cn'

type PreviewFrameProps = {
  label?: string
  className?: string
  children: React.ReactNode
}

function PreviewFrame({ label, className, children }: PreviewFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken',
        className
      )}
    >
      {label ? (
        <p className="border-border-subtle border-b px-stack py-2 font-mono text-[10px] text-muted uppercase tracking-wider">
          {label}
        </p>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  )
}

export function ComponentsLabShowcase() {
  return (
    <div className="flex flex-col gap-stack-xl">
      <PreviewFrame label="Live preview">
        <div className="flex flex-col gap-stack-lg px-gutter py-stack-lg">
          <ColumnShiftHoverWord
            text="Portfolio typography, in motion."
            className="font-semibold text-title tracking-tight"
          />
          <ColumnShiftHoverText
            text="Motion-driven column shift with canvas fallback"
            className="text-body-lg text-muted"
            hoverDuration={0.85}
          />
        </div>
      </PreviewFrame>

      <PreviewFrame label="LayoutGridGuide · 13 columns" className="h-48">
        <LayoutGridGuide className="absolute inset-0 h-full opacity-40" />
        <div className="relative z-10 flex h-48 items-center justify-center px-gutter">
          <p className="max-w-prose text-center text-caption text-muted">
            Dashed construction grid — same overlay used on the home page
          </p>
        </div>
      </PreviewFrame>

      <PreviewFrame label="GoldenRatioHero" className="h-72">
        <GoldenRatioHero className="!h-72 !min-h-0 w-full" />
      </PreviewFrame>

      <PreviewFrame label="R0ParticleLogo">
        <div className="flex items-center justify-center bg-background py-stack-lg">
          <R0ParticleLogo
            href="/lab/dithering-editor"
            className="block h-16 w-auto text-foreground"
            config={{ stippleGrid: 180, dotScale: 0.9 }}
          />
        </div>
      </PreviewFrame>

      <div className="flex flex-wrap gap-stack">
        <Link
          href="/hover-lab"
          className="rounded-md border border-border-subtle bg-surface-elevated px-4 py-2 text-body text-foreground transition-colors hover:bg-surface-sunken"
        >
          Open hover lab →
        </Link>
        <Link
          href="/scroll-lab"
          className="rounded-md border border-border-subtle bg-surface-elevated px-4 py-2 text-body text-foreground transition-colors hover:bg-surface-sunken"
        >
          Open scroll lab →
        </Link>
        <Link
          href="/lab/dithering-editor"
          className="rounded-md border border-border-subtle bg-surface-elevated px-4 py-2 text-body text-foreground transition-colors hover:bg-surface-sunken"
        >
          Open dithering editor →
        </Link>
      </div>
    </div>
  )
}
