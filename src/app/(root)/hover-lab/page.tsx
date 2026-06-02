import type { Metadata } from 'next'

import { HoverLabDemos } from '@/components/hover-lab-demos'

export const metadata: Metadata = {
  title: 'Hover lab',
  description: 'WebGL column-shift text hover driven by Motion',
}

export default function HoverLabPage() {
  return <HoverLabDemos />
}
