import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Design tokens',
  robots: { index: false, follow: false },
}

const swatches = [
  'background',
  'foreground',
  'muted',
  'muted-foreground',
  'surface-elevated',
  'surface-sunken',
  'border',
  'border-subtle',
  'accent',
  'accent-foreground',
  'accent-muted',
  'ring',
  'grid-line',
  'construction-stroke',
  'destructive',
  'destructive-foreground',
  'success',
] as const

const warmSwatches: { step: string; className: string }[] = [
  { step: '50', className: 'bg-warm-50' },
  { step: '100', className: 'bg-warm-100' },
  { step: '200', className: 'bg-warm-200' },
  { step: '300', className: 'bg-warm-300' },
  { step: '400', className: 'bg-warm-400' },
  { step: '500', className: 'bg-warm-500' },
  { step: '600', className: 'bg-warm-600' },
  { step: '700', className: 'bg-warm-700' },
  { step: '800', className: 'bg-warm-800' },
  { step: '900', className: 'bg-warm-900' },
  { step: '950', className: 'bg-warm-950' },
]

const typeSamples = [
  {
    label: 'Huge',
    className: 'text-huge font-regular tracking-tight text-muted',
  },
  {
    label: 'Large',
    className: 'text-large font-regular tracking-tight text-muted',
  },
  { label: 'Medium', className: 'text-medium text-muted' },
  {
    label: 'Display',
    className: 'text-display font-semibold tracking-tighter',
  },
  {
    label: 'Headline',
    className: 'text-headline font-semibold tracking-tight',
  },
  { label: 'Title', className: 'text-title font-semibold' },
  { label: 'Body lg', className: 'text-body-lg' },
  { label: 'Body', className: 'text-body' },
  { label: 'Caption', className: 'text-caption text-muted' },
  { label: 'Label', className: 'text-label uppercase text-muted' },
] as const

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

export default function TokensLabPage() {
  return (
    <main className="mx-auto max-w-content px-gutter py-section-y">
      <header className="mb-stack-xl max-w-prose">
        <p className="mb-stack text-label text-muted uppercase">
          Design system
        </p>
        <h1 className="font-semibold text-headline tracking-tight">
          Portfolio tokens
        </h1>
        <p className="mt-stack text-body-lg text-muted">
          Semantic colors, primitives, and typography for Tailwind CSS 4. Colors
          follow your system light or dark preference via light-dark(). See also{' '}
          <Link
            href="/lab/components"
            className="text-accent underline-offset-2 hover:underline"
          >
            portfolio components
          </Link>
          .
        </p>
      </header>

      <div className="flex flex-col gap-section-y">
        <Section title="Semantic colors">
          <ul className="grid gap-stack sm:grid-cols-2 lg:grid-cols-3">
            {swatches.map((name) => (
              <li
                key={name}
                className="flex items-center gap-stack overflow-hidden rounded-lg border border-border-subtle bg-surface-elevated shadow-xs"
              >
                <span
                  className="h-14 w-14 shrink-0 border-border-subtle border-r"
                  style={{ backgroundColor: `var(--color-${name})` }}
                  aria-hidden
                />
                <div className="min-w-0 py-2 pr-3">
                  <p className="font-mono text-foreground text-mono-sm">
                    {name}
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted">
                    bg-{name} / text-{name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Warm primitive scale">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {warmSwatches.map(({ step, className }) => (
              <li key={step} className="overflow-hidden rounded-md">
                <span
                  className={`block aspect-[4/3] w-full ${className}`}
                  aria-hidden
                />
                <p className="bg-surface-elevated px-2 py-1 font-mono text-[10px] text-muted">
                  warm-{step}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Typography">
          <ul className="flex flex-col gap-stack-lg">
            {typeSamples.map(({ label, className }) => (
              <li key={label}>
                <p className="mb-1 text-mono-sm text-muted">{label}</p>
                <p className={className}>
                  Tamas Palecian — React developer & designer
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Radius & shadow">
          <div className="flex flex-wrap gap-stack-lg">
            {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((r) => (
              <div
                key={r}
                className="flex h-20 w-20 items-center justify-center rounded-md border border-border-subtle bg-surface-elevated font-mono text-mono-sm text-muted shadow-portfolio"
                style={{ borderRadius: `var(--radius-${r})` }}
              >
                {r}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Motion">
          <div className="flex flex-wrap gap-stack">
            <div className="animate-fade-in rounded-lg bg-accent px-4 py-3 text-accent-foreground text-sm">
              animate-fade-in
            </div>
            <div className="animate-fade-up rounded-lg border border-border-subtle bg-surface-elevated px-4 py-3 text-sm">
              animate-fade-up
            </div>
          </div>
        </Section>
      </div>
    </main>
  )
}
