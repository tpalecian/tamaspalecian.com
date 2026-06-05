import { siteUrl } from '@/lib/seo/metadata'

export default async function sitemap() {
  const routes = ['', '/work'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes]
}
