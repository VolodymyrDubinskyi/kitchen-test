import Image from 'next/image'

import { isImageSource, isUploadPath } from '@kitchen/schemas'

const OPTIMIZED_HOST = 'cdn.dummyjson.com'

function isOptimizable(src: string): boolean {
  if (isUploadPath(src)) {
    return false
  }

  try {
    return new URL(src).hostname === OPTIMIZED_HOST
  } catch {
    return false
  }
}

export function ProductImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
}) {
  if (!isImageSource(src)) {
    return (
      <div
        role="presentation"
        style={{ width, height }}
        className={`shrink-0 rounded-md bg-zinc-200 dark:bg-zinc-800 ${className ?? ''}`}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized={!isOptimizable(src)}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  )
}
