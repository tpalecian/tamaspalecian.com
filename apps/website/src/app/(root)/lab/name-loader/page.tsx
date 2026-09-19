import type { Metadata } from 'next'

import { NameLoaderLabView } from './name-loader-lab-view'

export const metadata: Metadata = {
  title: 'Name loader',
  robots: { index: false, follow: false },
}

export default function NameLoaderLabPage() {
  return <NameLoaderLabView />
}
