export type SanitySlug = {
  current?: string
}

export type ProjectSummary = {
  _id: string
  title?: string
  slug?: SanitySlug
  excerpt?: string
  featuredImage?: unknown
  tags?: string[]
  year?: number
  publishedAt?: string
}

export type Project = ProjectSummary & {
  body?: unknown
  link?: string
  metadata?: unknown
  _updatedAt?: string
}

export type PageSummary = {
  _id: string
  title?: string
  slug?: SanitySlug
  excerpt?: string
  publishedAt?: string
}
