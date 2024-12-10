import { useCallback, useEffect, useState } from 'react'

export function useScroll(threshold: number = 0) {
  const [scrolled, setScrolled] = useState<boolean>(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.pageYOffset > threshold)
  }, [threshold])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return scrolled
}
