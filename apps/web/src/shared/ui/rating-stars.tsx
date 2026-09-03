import { MAX_RATING } from '@kitchen/schemas'

const STAR = '★'
const STARS = STAR.repeat(MAX_RATING)
const PERCENT = 100

export function RatingStars({ value, label }: { value: number; label: string }) {
  const filled = (Math.min(Math.max(value, 0), MAX_RATING) / MAX_RATING) * PERCENT

  return (
    <span role="img" aria-label={label} className="relative inline-block leading-none">
      <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">
        {STARS}
      </span>
      <span
        aria-hidden="true"
        data-testid="rating-stars-fill"
        style={{ width: `${filled}%` }}
        className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-amber-500"
      >
        {STARS}
      </span>
    </span>
  )
}
