import type { Metadata } from 'next'
import { Suspense } from 'react'

import { GrokBotsLabView } from './grok-bots-lab-view'

export const metadata: Metadata = {
  title: 'Grok bots',
  robots: { index: false, follow: false },
}

export default function GrokBotsLabPage() {
  return (
    <Suspense>
      <GrokBotsLabView />
    </Suspense>
  )
}
