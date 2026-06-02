'use client'

import { ColumnShiftHoverWord } from '@/components/column-shift-hover-word'

export function HoverLabDemos() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <header className="mb-16 space-y-3 border-stone-300 border-b pb-12">
          <p className="font-medium text-stone-500 text-xs uppercase tracking-[0.2em]">
            Shader lab
          </p>
          <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
            Column-shift hover
          </h1>
          <p className="max-w-2xl text-pretty text-stone-600 leading-relaxed">
            Port of the reference portfolio: rasterized text in an offscreen
            canvas, then a 16-slice column UV warp in WebGL (same fragment math
            as the original). Per-letter focus uses GSAP for{' '}
            <code className="rounded bg-stone-200/80 px-1.5 py-0.5 text-sm text-stone-800">
              uHover
            </code>{' '}
            and{' '}
            <code className="rounded bg-stone-200/80 px-1.5 py-0.5 text-sm text-stone-800">
              uStart
            </code>
            . If WebGL fails, the 2D fallback uses the same formulas. Hover a
            line to ramp the warp in, leave to ease out.
          </p>
        </header>

        <div className="flex flex-col gap-20">
          <section className="space-y-4">
            <h2 className="font-medium text-sm text-stone-500">
              Default · power-style easing
            </h2>
            <ColumnShiftHoverWord
              text="Interactive design, translated."
              className="font-semibold text-4xl tracking-tight md:text-5xl"
            />
          </section>

          <section className="space-y-4">
            <h2 className="font-medium text-sm text-stone-500">
              Faster · shorter hover
            </h2>
            <ColumnShiftHoverWord
              text="Faster in / out, shorter hold"
              className="font-medium text-3xl tracking-tight md:text-4xl"
              hoverDuration={0.45}
            />
          </section>

          <section className="space-y-4">
            <h2 className="font-medium text-sm text-stone-500">
              Longer ease out
            </h2>
            <ColumnShiftHoverWord
              text="Slower release on pointer leave"
              className="font-semibold text-2xl tracking-tight md:text-3xl"
              hoverDuration={0.85}
            />
          </section>

          <section className="space-y-4">
            <h2 className="font-medium text-sm text-stone-500">
              No intro · hover only
            </h2>
            <ColumnShiftHoverWord
              text="Displacement only when you hover — no uStart entrance"
              className="font-medium text-stone-800 text-xl leading-snug md:text-2xl"
              intro={false}
              hoverDuration={0.85}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
