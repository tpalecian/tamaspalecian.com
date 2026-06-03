import { apiVersion, dataset, previewURL, projectId, schema } from '@repo/cms'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import {
  defineDocuments,
  defineLocations,
  presentationTool,
} from 'sanity/presentation'
import { structureTool } from 'sanity/structure'

function resolveHref(documentType?: string, slug?: string): string | undefined {
  switch (documentType) {
    case 'page':
      return slug === 'home' ? '/' : `/${slug}`
    case 'project':
      return slug ? `/work/${slug}` : undefined
    default:
      return undefined
  }
}

export default defineConfig({
  name: 'default',
  title: 'Portfolio',
  projectId,
  dataset,
  schema,
  plugins: [
    presentationTool({
      resolve: {
        mainDocuments: defineDocuments([
          { route: '/', filter: `_type == "page" && slug.current == "home"` },
          {
            route: '/:slug',
            filter: `_type == "page" && slug.current == $slug`,
          },
          {
            route: '/work/:slug',
            filter: `_type == "project" && slug.current == $slug`,
          },
        ]),
        locations: {
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
        },
      },
      previewUrl: {
        origin: previewURL,
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
    }),
    structureTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
