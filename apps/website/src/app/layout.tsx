import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

import '@/styles/globals.css'

import { SanityLive } from '@repo/cms/live'
import { SmoothScrollProvider } from '@repo/ui'
import { cn } from '@repo/utilities/cn'
import { Analytics } from '@/components/layout/analytics'
import { BreakpointsIndicator } from '@/lib/dev/breakpoints-indicator'
import { rootMetadata } from '@/lib/seo/metadata'

const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
})

export const metadata = rootMetadata

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn('min-h-dvh font-sans', inter.variable)}>
        <SmoothScrollProvider>
          {children}
          <SanityLive />
        </SmoothScrollProvider>
        <Analytics />
        <BreakpointsIndicator />
      </body>
    </html>
  )
}
