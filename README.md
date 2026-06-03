# Tamas Palecian — Turborepo

Monorepo for the portfolio site and Sanity CMS, inspired by [darkroomengineering/satus](https://github.com/darkroomengineering/satus).

## Structure

| Package / App | Description |
|---------------|-------------|
| `apps/portfolio` | Next.js 16 site (Lenis + Motion, Tailwind v4 design tokens) |
| `apps/studio` | Sanity Studio (`pnpm dev:studio` → port 3333) |
| `packages/sanity` | Shared schemas, client, GROQ queries, live preview |
| `packages/ui` | Shared UI utilities (`cn`, `SmoothScrollProvider`) |
| `packages/typescript-config` | Shared TS configs |

## Setup

```bash
pnpm install
cp .env.example .env.local
# Add Sanity project ID, dataset, and tokens
```

## Development

```bash
pnpm dev              # portfolio + studio (turbo)
pnpm dev:portfolio    # http://localhost:3000
pnpm dev:studio       # http://localhost:3333
```

## Sanity

- Schemas: `page`, `project`, `siteSettings`, `metadata`
- Visual editing preview targets the portfolio app (`localhost:3000`)
- Draft mode: `/api/draft-mode/enable` and `/api/draft-mode/disable`

## Motion + Lenis

`SmoothScrollProvider` (`@repo/ui`) runs Lenis on the same `motion-dom` animation frame as `useScroll` / `useTransform` for parallax. See `apps/portfolio/src/components/effects/parallax-section.tsx`.
