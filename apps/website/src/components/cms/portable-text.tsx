import { PortableText, type PortableTextComponents } from '@portabletext/react'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-body text-muted-foreground">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-stack-lg font-semibold text-title">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-stack font-medium text-body-lg">{children}</h3>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === 'string' ? value.href : '#'
      const isExternal = href.startsWith('http')

      return (
        <a
          className="text-accent underline-offset-2 hover:underline"
          href={href}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {children}
        </a>
      )
    },
  },
}

type CmsPortableTextProps = {
  value?: unknown
}

export function CmsPortableText({ value }: CmsPortableTextProps) {
  if (!Array.isArray(value) || value.length === 0) return null

  return <PortableText components={components} value={value} />
}
