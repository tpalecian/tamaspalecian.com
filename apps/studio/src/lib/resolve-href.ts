export function resolveHref(
  documentType?: string,
  slug?: string
): string | undefined {
  switch (documentType) {
    case 'page':
      return slug === 'home' ? '/' : `/${slug}`
    case 'project':
      return slug ? `/work/${slug}` : undefined
    default:
      return undefined
  }
}
