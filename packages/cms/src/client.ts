import { createClient, type SanityClient } from 'next-sanity'
import {
  apiVersion,
  dataset,
  isSanityConfigured,
  projectId,
  studioUrl,
} from './env'

export const client: SanityClient | null = isSanityConfigured()
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
      stega: {
        studioUrl,
        filter: (props) => {
          if (props.sourcePath.at(-1) === 'title') {
            return true
          }
          return props.filterDefault(props)
        },
      },
    })
  : null
