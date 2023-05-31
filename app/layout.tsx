import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import '@/styles/globals.css'

import { LayoutProps } from '@/types/next'

import { cn } from '@/lib/cn'

import { Analytics } from '@/components/analytics'
import { BreakpointsIndicator } from '@/components/breakpoints-indicator'

const inter = Inter({
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Tamas Palecian',
    template: '%s | Tamas Palecian',
  },
  description: 'React Developer, designer, and open source enthusiast.',
  openGraph: {
    title: 'Tamas Palecian',
    description: 'React Developer, designer, and open source enthusiast.',
    url: 'https://tamaspalecian.com',
    siteName: 'Tamas Palecian',
    images: [
      {
        url: 'https://tamaspalecian.com/og.jpg',
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

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className="h-full">
      <body className={cn('h-full font-sans', inter.variable)}>
        {children}
        <Analytics />
        <BreakpointsIndicator />
      </body>
    </html>
  )
}
