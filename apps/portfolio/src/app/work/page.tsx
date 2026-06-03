import {
  allProjectsQuery,
  isSanityConfigured,
  type ProjectSummary,
  sanityFetch,
} from '@repo/sanity'
import Link from 'next/link'
import { Suspense } from 'react'

function WorkFallback() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <div className="h-10 w-32 animate-pulse rounded bg-muted" />
      <ul className="mt-12 flex flex-col gap-8">
        {[1, 2, 3].map((i) => (
          <li key={i} className="h-16 animate-pulse rounded bg-muted" />
        ))}
      </ul>
    </main>
  )
}

async function WorkContent() {
  if (!isSanityConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-semibold text-display">Work</h1>
        <p className="mt-4 text-muted-foreground">
          Configure Sanity env vars to load projects from the CMS. Run{' '}
          <code className="text-sm">pnpm dev:studio</code> to manage content.
        </p>
      </main>
    )
  }

  const { data } = await sanityFetch({ query: allProjectsQuery })
  const projects = (data ?? []) as ProjectSummary[]

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-semibold text-display">Work</h1>
      <ul className="mt-12 flex flex-col gap-8">
        {projects.map((item) => (
          <li key={item._id}>
            <Link
              href={`/work/${item.slug?.current ?? ''}`}
              className="group block"
            >
              <h2 className="font-medium text-title group-hover:text-accent">
                {item.title}
              </h2>
              {item.excerpt ? (
                <p className="mt-2 text-muted-foreground">{item.excerpt}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default function WorkPage() {
  return (
    <Suspense fallback={<WorkFallback />}>
      <WorkContent />
    </Suspense>
  )
}
