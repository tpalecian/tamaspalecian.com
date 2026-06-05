import {
  isSanityConfigured,
  type Project,
  projectQuery,
  sanityFetch,
} from '@repo/cms'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { CmsPortableText } from '@/components/cms/portable-text'

type PageProps = {
  params: Promise<{ slug: string }>
}

function ProjectFallback() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-muted" />
    </main>
  )
}

async function ProjectContent({ params }: PageProps) {
  const { slug } = await params

  if (!isSanityConfigured()) {
    notFound()
  }

  const { data } = await sanityFetch({
    query: projectQuery,
    params: { slug },
  })
  const project = data as Project | null

  if (!project) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-caption text-muted-foreground">
        {project.year ?? project.publishedAt}
      </p>
      <h1 className="mt-2 font-semibold text-display">{project.title}</h1>
      {project.excerpt ? (
        <p className="mt-6 text-body text-muted-foreground">
          {project.excerpt}
        </p>
      ) : null}
      <div className="mt-stack-xl flex flex-col gap-stack">
        <CmsPortableText value={project.body} />
      </div>
    </main>
  )
}

export default function ProjectPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ProjectFallback />}>
      <ProjectContent params={params} />
    </Suspense>
  )
}
