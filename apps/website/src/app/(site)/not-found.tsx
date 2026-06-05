import { Link } from '@/components/ui/link'

export default function SiteNotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-prose flex-col justify-center px-gutter py-section-y">
      <p className="text-caption text-muted-foreground">404</p>
      <h1 className="mt-stack font-semibold text-display tracking-tight">
        Page not found
      </h1>
      <p className="mt-stack text-body text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        className="mt-stack-lg inline-flex w-fit rounded-md border border-border-subtle bg-surface-elevated px-4 py-2 text-caption text-foreground transition-colors hover:bg-surface-sunken"
        href="/"
      >
        Back home
      </Link>
    </main>
  )
}
