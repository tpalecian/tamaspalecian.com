# Tamas Palecian — Turborepo

Monorepo for the portfolio site and Sanity CMS, inspired by [darkroomengineering/satus](https://github.com/darkroomengineering/satus).

## Structure

All workspace names use **kebab-case**.

```
apps/
  website/             @repo/website          Next.js site
  studio/              @repo/studio           Sanity Studio (:3333)

packages/
  cms/                 @repo/cms              Schemas, client, GROQ, live preview
  ui/                  @repo/ui               UI primitives (Lenis smooth scroll, etc.)
  utilities/           @repo/utilities        Shared helpers (cn)
  tsconfig/            @repo/tsconfig         TypeScript configs
```

Studio config (`sanity.config.ts`, `sanity.cli.ts`) lives in **`apps/studio`**. `@repo/cms` is only the portable data layer.

### TypeScript path aliases

Both apps define `paths` in their local `tsconfig.json` (resolved from each app root):

| Alias | `apps/website` | `apps/studio` |
|-------|----------------|---------------|
| `@/*` | `./src/*` | `./src/*` |
| `@/components/*` | `./src/components/*` | — |
| `@/lib/*` | `./src/lib/*` | `./src/lib/*` |
| `@/styles/*` | `./src/styles/*` | — |
| `@public/*` | `./public/*` | — |

Example: `import { cn } from '@repo/utilities/cn'` (workspace package) and `import { Analytics } from '@/components/analytics'` (app alias).

## Setup

```bash
pnpm install
cp .env.example .env.local
# Add Sanity project ID, dataset, and tokens
```

## Development

```bash
pnpm dev                    # website + studio
pnpm dev:website            # http://localhost:3000
pnpm dev:studio             # http://localhost:3333
```

## CMS typegen

```bash
pnpm cms:typegen
```

## Motion + Lenis

`SmoothScrollProvider` from `@repo/ui` runs Lenis on the same `motion-dom` frame as Motion (`useScroll`, `useTransform`). See `apps/website/src/components/effects/parallax-section.tsx`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, conventional commits, and the PR-only workflow for `main`.
