import type { Metadata } from 'next'
import Link from 'next/link'

import { GrokBotApp } from '@/components/grok-bot-app/grok-bot-app'
import { grokBotAppSnapshot } from '@/components/grok-bot-app/grok-bot-app-data'

export const metadata: Metadata = {
  title: 'Grok bot app',
  robots: { index: false, follow: false },
}

export default function GrokBotAppLabPage() {
  return (
    <main className="mx-auto max-w-content px-gutter py-section-y">
      <header className="mb-stack-xl max-w-prose">
        <p className="mb-stack text-label text-muted uppercase">Lab</p>
        <h1 className="font-semibold text-headline tracking-tight">
          Grok bot app
        </h1>
        <p className="mt-stack text-body-lg text-muted">
          Interactive UI recreation of the Grok bot desktop app: resize or
          collapse the sidebar, open an agent&apos;s computer and settings, or
          add a new agent.{' '}
          <Link
            href="/lab/components"
            className="text-accent underline-offset-2 hover:underline"
          >
            Portfolio components
          </Link>
        </p>
      </header>
      <div className="mt-stack-xl">
        <GrokBotApp {...grokBotAppSnapshot} />
      </div>
    </main>
  )
}
