import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

import '@/styles/globals.css'

import { Analytics } from '@/components/analytics'
import { BreakpointsIndicator } from '@/components/breakpoints-indicator'
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider'
import { ThemeSync } from '@/components/theme-sync'
import { TimeThemeSelect } from '@/components/time-theme-select'
import { cn } from '@/library/cn'

const inter = Inter({
  variable: '--font-inter',
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

const THEME_INIT = `(function(){
  try {
    var KEY = 'portfolio-time-theme';
    var modes = { auto:1, dawn:1, day:1, 'golden-hour':1, dusk:1, night:1 };
    var mode = 'auto';
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed.mode === 'string' && modes[parsed.mode]) {
          mode = parsed.mode;
        }
      }
    } catch (_) {}
    var root = document.documentElement;
    root.setAttribute('data-theme', mode);
    if (mode === 'auto') {
      var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', dark);
    } else {
      root.classList.remove('dark');
    }
  } catch (_) {}
})();`

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn('h-full font-sans', inter.variable)}>
        <Script id="ds-theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <ThemeSync />
        <TimeThemeSelect />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Analytics />
        <BreakpointsIndicator />
      </body>
    </html>
  )
}
