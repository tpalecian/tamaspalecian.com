import type { Metadata } from 'next'

import { ScrollLabDemo } from '@/components/scroll-lab-demo'

export const metadata: Metadata = {
  title: 'Scroll lab',
  description: 'Lenis + Motion scroll integration playground',
}

export default function ScrollLabPage() {
  return <ScrollLabDemo />
}
