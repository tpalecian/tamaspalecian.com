import NextLink from 'next/link'
import type { ComponentProps } from 'react'

type LinkProps = ComponentProps<typeof NextLink>

function isExternalHref(href: LinkProps['href']) {
  if (typeof href !== 'string') return false

  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  )
}

export function Link({ href, children, className, ...props }: LinkProps) {
  if (isExternalHref(href)) {
    return (
      <a
        className={className}
        href={href as string}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    )
  }

  return (
    <NextLink className={className} href={href} {...props}>
      {children}
    </NextLink>
  )
}
