'use client'

export function IntroSkip() {
  return (
    <button
      type="button"
      className="absolute inset-0 z-10 cursor-default"
      aria-label="Skip introduction"
      onClick={() => {
        document.documentElement.style.overflow = ''
        document.querySelector('[data-page-intro]')?.remove()
      }}
    />
  )
}
