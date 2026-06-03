import type { SchemaTypeDefinition } from 'sanity'
import { metadata } from './metadata'
import { page } from './page'
import { project } from './project'
import { siteSettings } from './site-settings'

export { metadata, page, project, siteSettings }

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [metadata, page, project, siteSettings],
}
