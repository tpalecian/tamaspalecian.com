'use client'

import { useState } from 'react'

import { NameLoader } from '@/components/pre-portfolio/name-loader'

export function NameLoaderLabView() {
  const [runId, setRunId] = useState(0)
  const [complete, setComplete] = useState(false)

  return (
    <>
      <NameLoader
        key={runId}
        onComplete={() => {
          setComplete(true)
        }}
      />
      <main className="min-h-[220vh] bg-white px-gutter py-section-y text-foreground">
        <p className="text-label text-muted uppercase">Lab</p>
        <h1 className="mt-stack font-semibold text-headline tracking-tight">
          Name loader
        </h1>
        <p className="mt-stack max-w-prose text-body text-muted">
          Isolated preview of the timed liquid SVG loader. Scroll stays locked
          until the fill and dissolve finish. Reload or replay to watch again.
        </p>
        <p
          className="mt-stack-lg font-mono text-caption"
          data-loader-complete={complete ? 'true' : 'false'}
        >
          {complete ? 'Scroll unlocked' : 'Scroll locked — loader running'}
        </p>
        {complete ? (
          <button
            type="button"
            className="mt-stack rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-caption transition-colors hover:bg-surface-sunken"
            onClick={() => {
              setComplete(false)
              setRunId((id) => id + 1)
            }}
          >
            Replay
          </button>
        ) : null}
        <p className="mt-[80vh] text-body-sm text-muted">
          Spacer below the fold — used to confirm scroll is locked, then free.
        </p>
      </main>
    </>
  )
}
