import { cn } from '@repo/utilities/cn'
import type { ReactNode } from 'react'

import '@/styles/intro.css'

import { IntroCopy } from './intro-copy'
import { IntroSkip } from './intro-skip'

type PageIntroProps = {
  children: ReactNode
  className?: string
}

export function PageIntro({ children, className }: PageIntroProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="relative">{children}</div>

      <div
        data-page-intro
        className="fixed inset-0 z-overlay flex bg-background will-change-[clip-path]"
        role="dialog"
        aria-modal="true"
        aria-label="Site introduction"
      >
        <IntroSkip />

        <div className="relative z-20 flex w-full items-center px-gutter">
          <div className="intro-text max-w-narrow will-change-[clip-path,transform,opacity]">
            <IntroCopy />
          </div>
        </div>
      </div>
    </div>
  )
}
