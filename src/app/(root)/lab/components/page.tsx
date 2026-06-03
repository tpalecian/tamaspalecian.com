import type { Metadata } from 'next'
import Link from 'next/link'

import { ComponentsLabShowcase } from '@/components/components-lab-showcase'
import { cn } from '@/library/cn'

export const metadata: Metadata = {
  title: 'Portfolio components',
  robots: { index: false, follow: false },
}

type ComponentEntry = {
  name: string
  path: string
  description: string
  props: string[]
  usedOn?: string
  labHref?: string
}

const textEffects: ComponentEntry[] = [
  {
    name: 'ColumnShiftHoverWord',
    path: 'src/components/column-shift-hover-word.tsx',
    description:
      'GSAP-driven per-letter column UV warp. Splits text with SplitType, rasterizes to canvas, renders via WebGL shader with 2D fallback.',
    props: ['text', 'className', 'letterClassName', 'intro', 'hoverDuration'],
    usedOn: '/hover-lab',
    labHref: '/hover-lab',
  },
  {
    name: 'ColumnShiftHoverText',
    path: 'src/components/column-shift-hover-text.tsx',
    description:
      'Motion-based variant of the column-shift effect. Supports controlled hover state, focus targeting, and spring transitions.',
    props: [
      'text',
      'className',
      'interactive',
      'active',
      'focusX',
      'focusSpread',
      'intro',
      'hoverDuration',
      'hoverTransition',
    ],
  },
]

const layoutAndHero: ComponentEntry[] = [
  {
    name: 'LayoutGridGuide',
    path: 'src/components/layout-grid-guide.tsx',
    description:
      'Full-viewport dashed column grid overlay. Configurable track count, line color, and edge-track visibility.',
    props: ['columns', 'track', 'lineColor', 'hideEdgeTracks', 'className'],
    usedOn: '/',
  },
  {
    name: 'GoldenRatioHero',
    path: 'src/components/golden-ratio-hero.tsx',
    description:
      'Animated SVG construction lines with staggered path drawing. Respects prefers-reduced-motion.',
    props: ['className'],
  },
]

const brandAndLabs: ComponentEntry[] = [
  {
    name: 'R0ParticleLogo',
    path: 'src/components/r0-particle-logo.tsx',
    description:
      'Stippled “R0” mark rendered on canvas with Bayer or Floyd–Steinberg dithering. Pointer-reactive particle displacement.',
    props: [
      'sourceImageUrl',
      'alternateSourceImageUrl',
      'config',
      'href',
      'className',
    ],
    labHref: '/lab/dithering-editor',
  },
  {
    name: 'R0ParticleLogoLab',
    path: 'src/components/r0-particle-logo-lab.tsx',
    description:
      'Interactive editor shell for tuning particle logo parameters (grid, contrast, dither mode, displacement).',
    props: ['— (page shell)'],
    labHref: '/lab/dithering-editor',
  },
  {
    name: 'HoverLabDemos',
    path: 'src/components/hover-lab-demos.tsx',
    description:
      'Column-shift hover variants and timing presets for shader QA.',
    props: ['— (composed demos)'],
    labHref: '/hover-lab',
  },
  {
    name: 'ScrollLabDemo',
    path: 'src/components/scroll-lab-demo.tsx',
    description:
      'Lenis smooth scroll with progress bar, parallax sections, and anchor jumps.',
    props: ['— (composed demo)'],
    labHref: '/scroll-lab',
  },
]

const infrastructure: ComponentEntry[] = [
  {
    name: 'SmoothScrollProvider',
    path: 'src/components/smooth-scroll-provider.tsx',
    description: 'Wraps the app with Lenis for inertia scrolling site-wide.',
    props: ['children'],
    usedOn: 'Root layout',
  },
  {
    name: 'BreakpointsIndicator',
    path: 'src/components/breakpoints-indicator.tsx',
    description: 'Dev-only overlay showing the active Tailwind breakpoint.',
    props: ['—'],
    usedOn: 'Root layout',
  },
  {
    name: 'Analytics',
    path: 'src/components/analytics.tsx',
    description: 'Vercel Analytics integration.',
    props: ['—'],
    usedOn: 'Root layout',
  },
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-border-subtle border-t pt-section-y first:border-t-0 first:pt-0">
      <h2 className="mb-stack-lg text-label text-muted uppercase">{title}</h2>
      {children}
    </section>
  )
}

function ComponentCard({ entry }: { entry: ComponentEntry }) {
  return (
    <article className="flex flex-col gap-stack rounded-lg border border-border-subtle bg-surface-elevated p-stack-lg shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-stack">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-title">
            {entry.name}
          </h3>
          <p className="mt-1 truncate font-mono text-[10px] text-muted">
            {entry.path}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {entry.usedOn ? (
            <span className="rounded-md bg-surface-sunken px-2 py-0.5 font-mono text-[10px] text-muted">
              {entry.usedOn}
            </span>
          ) : null}
          {entry.labHref ? (
            <Link
              href={entry.labHref}
              className="rounded-md border border-border-subtle px-2 py-0.5 font-mono text-[10px] text-accent transition-colors hover:bg-surface-sunken"
            >
              Open lab →
            </Link>
          ) : null}
        </div>
      </div>
      <p className="text-body text-muted">{entry.description}</p>
      <div>
        <p className="mb-1 text-mono-sm text-muted">Props</p>
        <ul className="flex flex-wrap gap-1.5">
          {entry.props.map((prop) => (
            <li
              key={prop}
              className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-foreground"
            >
              {prop}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function ComponentGrid({ entries }: { entries: ComponentEntry[] }) {
  return (
    <ul className="grid gap-stack-lg lg:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.name}>
          <ComponentCard entry={entry} />
        </li>
      ))}
    </ul>
  )
}

const labLinks = [
  { href: '/lab/tokens', label: 'Design tokens' },
  { href: '/hover-lab', label: 'Hover lab' },
  { href: '/scroll-lab', label: 'Scroll lab' },
  { href: '/lab/dithering-editor', label: 'Dithering editor' },
  { href: '/lab/motion/spring', label: 'Motion · spring' },
] as const

export default function ComponentsLabPage() {
  return (
    <main className="mx-auto max-w-content px-gutter py-section-y">
      <header className="mb-stack-xl max-w-prose">
        <p className="mb-stack text-label text-muted uppercase">
          Design system
        </p>
        <h1 className="font-semibold text-headline tracking-tight">
          Portfolio components
        </h1>
        <p className="mt-stack text-body-lg text-muted">
          Every interactive building block in this portfolio — typography
          shaders, layout overlays, brand marks, and lab demos. Pair with{' '}
          <Link
            href="/lab/tokens"
            className="text-accent underline-offset-2 hover:underline"
          >
            design tokens
          </Link>{' '}
          for colors, type, and motion primitives.
        </p>
        <nav
          aria-label="Lab pages"
          className="mt-stack-lg flex flex-wrap gap-2"
        >
          {labLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md border border-border-subtle px-3 py-1.5 text-caption transition-colors',
                href === '/lab/tokens'
                  ? 'text-muted hover:bg-surface-elevated'
                  : 'bg-surface-elevated text-foreground hover:bg-surface-sunken'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="flex flex-col gap-section-y">
        <Section title="Live previews">
          <ComponentsLabShowcase />
        </Section>

        <Section title="Typography & shaders">
          <ComponentGrid entries={textEffects} />
        </Section>

        <Section title="Layout & hero">
          <ComponentGrid entries={layoutAndHero} />
        </Section>

        <Section title="Brand & labs">
          <ComponentGrid entries={brandAndLabs} />
        </Section>

        <Section title="App infrastructure">
          <ComponentGrid entries={infrastructure} />
        </Section>
      </div>
    </main>
  )
}
