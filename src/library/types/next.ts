import type { ReactNode } from 'react'

export interface ErrorProps {
  /**
   * The instance of the error that occurred.
   */
  error: Error

  /**
   * A method to reset the error boundary.
   */
  reset: () => void
}

export interface HeadProps {
  /**
   * The dynamic route parameters object from the root segment down to the current head.
   */
  params: Record<string, string | string[] | undefined>
}

export interface LayoutProps {
  /**
   * Content to be rendered inside the layout.
   */
  children: ReactNode
}

export interface PageProps {
  /**
   * The dynamic route parameters object from the root segment down to the current page.
   */
  params: Record<string, string | string[] | undefined>

  /**
   * The URL search parameters object.
   */
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}
