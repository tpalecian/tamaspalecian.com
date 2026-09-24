import type { Metadata } from 'next'
import { Suspense } from 'react'

import { GrokBotLabView } from './grok-bot-lab-view'

export const metadata: Metadata = {
  title: 'Grok bot',
  robots: { index: false, follow: false },
}

function GrokBotLabFallback() {
  return (
    <main className="mx-auto max-w-content px-gutter py-section-y">
      <p className="mb-stack text-label text-muted uppercase">Lab</p>
      <h1 className="font-semibold text-headline tracking-tight">Grok bot</h1>
    </main>
  )
}

export default function GrokBotLabPage() {
  return (
    <Suspense fallback={<GrokBotLabFallback />}>
      <GrokBotLabView />
    </Suspense>
  )
}
