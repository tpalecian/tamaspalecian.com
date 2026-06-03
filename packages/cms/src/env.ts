import { z } from 'zod'

export const sanityEnvSchema = z.object({
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().optional(),
  NEXT_PUBLIC_SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_API_WRITE_TOKEN: z.string().optional(),
  SANITY_PRIVATE_TOKEN: z.string().optional(),
})

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-03-01'

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ??
  process.env.SANITY_STUDIO_DATASET ??
  'production'

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
  process.env.SANITY_STUDIO_PROJECT_ID ??
  ''

export const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3333'
    : `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/studio`)

export const publicToken =
  process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN ??
  process.env.SANITY_API_READ_TOKEN ??
  ''

export const privateToken =
  process.env.SANITY_PRIVATE_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN ?? ''

export const previewURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_BASE_URL ?? '')

export function isSanityConfigured(): boolean {
  return Boolean(projectId && dataset)
}
