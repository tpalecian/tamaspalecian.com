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
  smooth-scroll/       @repo/smooth-scroll    Lenis + motion-dom frame sync
  shared/              @repo/shared           Shared utilities (cn)
  tsconfig/            @repo/tsconfig         TypeScript configs
```

Studio config (`sanity.config.ts`, `sanity.cli.ts`) lives in **`apps/studio`** — the CMS package only holds portable data-layer code.

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

`@repo/smooth-scroll` runs Lenis on the same `motion-dom` frame as Motion (`useScroll`, `useTransform`). See `apps/website/src/components/effects/parallax-section.tsx`.
