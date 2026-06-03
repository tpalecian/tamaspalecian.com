# Tamas Palecian — Turborepo

Monorepo for the portfolio site and Sanity CMS, inspired by [darkroomengineering/satus](https://github.com/darkroomengineering/satus).

## Structure

All workspace names use **kebab-case**.

```
apps/
  portfolio/           @repo/portfolio     Next.js site
  sanity-studio/       @repo/sanity-studio  Sanity Studio (:3333)

packages/
  cms/                 @repo/cms            Schemas, client, GROQ, live preview
  smooth-scroll/       @repo/smooth-scroll  Lenis + motion-dom frame sync
  shared/              @repo/shared         Shared utilities (cn)
  tsconfig/            @repo/tsconfig         TypeScript configs
```

Studio config (`sanity.config.ts`, `sanity.cli.ts`) lives in **`apps/sanity-studio`** — the CMS package only holds portable data-layer code.

## Setup

```bash
pnpm install
cp .env.example .env.local
# Add Sanity project ID, dataset, and tokens
```

## Development

```bash
pnpm dev                    # portfolio + sanity-studio
pnpm dev:portfolio          # http://localhost:3000
pnpm dev:sanity-studio      # http://localhost:3333
```

## CMS typegen

```bash
pnpm cms:typegen
```

## Motion + Lenis

`@repo/smooth-scroll` runs Lenis on the same `motion-dom` frame as Motion (`useScroll`, `useTransform`). See `apps/portfolio/src/components/effects/parallax-section.tsx`.
