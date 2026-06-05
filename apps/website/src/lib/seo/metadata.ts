import type { Metadata } from 'next'

export const siteUrl = 'https://tamaspalecian.com'

const defaultDescription =
  'React Developer, designer, and open source enthusiast.'

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Tamas Palecian',
    template: '%s | Tamas Palecian',
  },
  description: defaultDescription,
  openGraph: {
    title: 'Tamas Palecian',
    description: defaultDescription,
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

type PageMetadataOptions = {
  title: string
  description?: string
  noIndex?: boolean
}

export function createPageMetadata({
  title,
  description,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
