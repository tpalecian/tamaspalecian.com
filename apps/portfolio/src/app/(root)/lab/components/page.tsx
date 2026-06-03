import type { Metadata } from 'next'
import Link from 'next/link'

import { LayoutGridGuide } from '@/components/layout-grid-guide'

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
}

const layoutComponents: ComponentEntry[] = [
  {
    name: 'LayoutGridGuide',
    path: 'src/components/layout-grid-guide.tsx',
    description:
      'Full-viewport dashed column grid overlay. Configurable track count, line color, and edge-track visibility.',
    props: [
      'columns',
      'track',
      'lineColor',
      'hideEdgeTracks',
      'className',
      'lineClassName',
    ],
    usedOn: '/',
  },
]

const infrastructure: ComponentEntry[] = [
  {
    name: 'SmoothScrollProvider',
    path: 'packages/ui/src/smooth-scroll-provider.tsx',
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
        {entry.usedOn ? (
          <span className="rounded-md bg-surface-sunken px-2 py-0.5 font-mono text-[10px] text-muted">
            {entry.usedOn}
          </span>
        ) : null}
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
          Building blocks for the portfolio shell. Pair with{' '}
          <Link
            href="/lab/tokens"
            className="text-accent underline-offset-2 hover:underline"
          >
            design tokens
          </Link>{' '}
          for colors, type, and motion.
        </p>
        <nav
          aria-label="Styleguide"
          className="mt-stack-lg flex flex-wrap gap-2"
        >
          <Link
            href="/lab/tokens"
            className="rounded-md border border-border-subtle px-3 py-1.5 text-caption text-muted transition-colors hover:bg-surface-elevated"
          >
            Design tokens
          </Link>
          <Link
            href="/"
            className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-caption text-foreground transition-colors hover:bg-surface-sunken"
          >
            Portfolio home
          </Link>
        </nav>
      </header>

      <div className="flex flex-col gap-section-y">
        <Section title="Live preview">
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-sunken">
            <p className="border-border-subtle border-b px-stack py-2 font-mono text-[10px] text-muted uppercase tracking-wider">
              LayoutGridGuide · 13 columns
            </p>
            <div className="relative h-56">
              <LayoutGridGuide className="absolute inset-0 h-full opacity-40" />
              <div className="relative z-10 flex h-56 items-center justify-center px-gutter">
                <p className="max-w-prose text-center text-caption text-muted">
                  Construction grid used on the portfolio home page
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Layout">
          <ul className="grid gap-stack-lg">
            {layoutComponents.map((entry) => (
              <li key={entry.name}>
                <ComponentCard entry={entry} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="App infrastructure">
          <ul className="grid gap-stack-lg lg:grid-cols-2">
            {infrastructure.map((entry) => (
              <li key={entry.name}>
                <ComponentCard entry={entry} />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </main>
  )
}
