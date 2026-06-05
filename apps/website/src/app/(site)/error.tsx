'use client'

import { useEffect } from 'react'

import { Link } from '@/components/ui/link'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SiteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-prose flex-col justify-center px-gutter py-section-y">
      <p className="text-caption text-muted-foreground">Something went wrong</p>
      <h1 className="mt-stack font-semibold text-display tracking-tight">
        We hit a snag
      </h1>
      <p className="mt-stack text-body text-muted-foreground">
        Try again, or return to the portfolio home.
      </p>
      <div className="mt-stack-lg flex flex-wrap gap-3">
        <button
          className="rounded-md border border-border-subtle bg-surface-elevated px-4 py-2 text-caption text-foreground transition-colors hover:bg-surface-sunken"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
        <Link
          className="rounded-md border border-border-subtle px-4 py-2 text-caption text-muted transition-colors hover:bg-surface-elevated"
          href="/"
        >
          Back home
        </Link>
      </div>
    </main>
  )
}
