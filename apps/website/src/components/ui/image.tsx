import { cn } from '@repo/utilities/cn'
import type { SanityImageSource } from '@sanity/image-url'
import NextImage, { type ImageProps as NextImageProps } from 'next/image'

import { urlFor } from '@/lib/sanity/image'

type SanityImageProps = Omit<NextImageProps, 'src'> & {
  image: SanityImageSource
  width?: number
  height?: number
}

export function Image({
  image,
  alt,
  width = 1920,
  height = 1080,
  className,
  ...props
}: SanityImageProps) {
  const src = urlFor(image).width(width).height(height).auto('format').url()

  return (
    <NextImage
      alt={alt}
      className={cn(className)}
      height={height}
      src={src}
      width={width}
      {...props}
    />
  )
}
