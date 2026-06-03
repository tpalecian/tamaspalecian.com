import { ParallaxSection } from '@/components/effects/parallax-section'
import { PageIntro } from '@/components/intro/page-intro'
import { LayoutGridGuide } from '@/components/layout-grid-guide'

export default function Page() {
  return (
    <PageIntro>
      <ParallaxSection className="min-h-[40vh]">
        <div className="mx-auto max-w-3xl px-6 pt-24">
          <p className="text-caption text-muted-foreground">Portfolio</p>
          <h1 className="mt-4 font-semibold text-display tracking-tight">
            Tamas Palecian
          </h1>
          <p className="mt-4 max-w-xl text-body text-muted-foreground">
            React developer, designer, and open source enthusiast. Smooth scroll
            via Lenis, motion-driven parallax, content from Sanity.
          </p>
        </div>
      </ParallaxSection>
      <LayoutGridGuide />
    </PageIntro>
  )
}
