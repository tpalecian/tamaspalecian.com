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
  params: Object
}

export interface LayoutProps {
  /**
   * Content to be rendered inside the layout.
   */
  children: React.ReactNode
}

export interface PageProps {
  /**
   * The dynamic route parameters object from the root segment down to the current page.
   */
  params: Object

  /**
   * The URL search parameters object.
   */
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}
