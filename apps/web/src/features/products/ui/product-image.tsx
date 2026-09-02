import Image from 'next/image'

const OPTIMIZED_HOST = 'cdn.dummyjson.com'

function isOptimizable(src: string): boolean {
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
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized={!isOptimizable(src)}
      className={className}
    />
  )
}
