import { defineDocuments, defineLocations } from 'sanity/presentation'
import { resolveHref } from '@/lib/resolve-href'

export const presentationMainDocuments = defineDocuments([
  { route: '/', filter: `_type == "page" && slug.current == "home"` },
  {
    route: '/:slug',
    filter: `_type == "page" && slug.current == $slug`,
  },
  {
    route: '/work/:slug',
    filter: `_type == "project" && slug.current == $slug`,
  },
])

export const presentationLocations = {
  page: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: (doc) => {
      const href = resolveHref('page', doc?.slug)
      return {
        locations: href ? [{ title: doc?.title ?? 'Page', href }] : [],
      }
    },
  }),
  project: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: (doc) => {
      const href = resolveHref('project', doc?.slug)
      return {
        locations: href
          ? [{ title: doc?.title ?? 'Project', href }]
          : [],
      }
    },
  }),
}
