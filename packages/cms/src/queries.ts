import { defineQuery } from 'next-sanity'

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings"][0] {
    title,
    description,
    ogImage
  }
`)

export const pageQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    body,
    metadata,
    publishedAt,
    _updatedAt
  }
`)

export const allPagesQuery = defineQuery(`
  *[_type == "page"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt
  }
`)

export const projectQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    body,
    tags,
    year,
    link,
    metadata,
    publishedAt,
    _updatedAt
  }
`)

export const allProjectsQuery = defineQuery(`
  *[_type == "project"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    tags,
    year,
    publishedAt
  }
`)
