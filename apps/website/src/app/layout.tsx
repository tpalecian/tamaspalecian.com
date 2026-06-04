import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'

import '@/styles/globals.css'

import { SanityLive } from '@repo/cms/live'
import { SmoothScrollProvider } from '@repo/ui'
import { cn } from '@repo/utilities/cn'
import { Analytics } from '@/components/analytics'
import { BreakpointsIndicator } from '@/components/breakpoints-indicator'

const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
})

const siteUrl = 'https://tamaspalecian.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Tamas Palecian',
    template: '%s | Tamas Palecian',
  },
  description: 'React Developer, designer, and open source enthusiast.',
  openGraph: {
    title: 'Tamas Palecian',
    description: 'React Developer, designer, and open source enthusiast.',
    url: siteUrl,
    siteName: 'Tamas Palecian',
    images: [
      {
        url: '/og.jpg',
        width: 1920,
        height: 1080,
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Tamas Palecian',
    card: 'summary_large_image',
  },
  icons: {
    shortcut: '/favicon.ico',
  },
}

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
