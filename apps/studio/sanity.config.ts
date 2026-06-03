import {
  presentationLocations,
  presentationMainDocuments,
} from '@/lib/presentation'
import { apiVersion, dataset, previewURL, projectId, schema } from '@repo/cms'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'Portfolio',
  projectId,
  dataset,
  schema,
  plugins: [
    presentationTool({
      resolve: {
        mainDocuments: presentationMainDocuments,
        locations: presentationLocations,
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
