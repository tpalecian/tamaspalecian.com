import { useEffect, useLayoutEffect } from 'react'

export function useIsomorphicEffect():
  | typeof useEffect
  | typeof useLayoutEffect {
  return typeof window !== 'undefined' ? useLayoutEffect : useEffect
}
