import type { Metadata } from 'next'
import { Suspense } from 'react'

import { NameLoaderLabView } from './name-loader-lab-view'

export const metadata: Metadata = {
  title: 'Name loader',
  robots: { index: false, follow: false },
}

export default function NameLoaderLabPage() {
  return (
    <Suspense>
      <NameLoaderLabView />
    </Suspense>
  )
}
