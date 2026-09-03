const FORMATTERS = new Map<string, Intl.NumberFormat>()

const DEFAULT_LOCALE = 'en-US'
const CURRENCY = 'USD'

export function formatPrice(value: number, locale: string | undefined = DEFAULT_LOCALE): string {
  const cached = FORMATTERS.get(locale)

  if (cached) {
    return cached.format(value)
  }

  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: CURRENCY })
  FORMATTERS.set(locale, formatter)

  return formatter.format(value)
}

const DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

export function formatDate(value: string, locale: string | undefined = DEFAULT_LOCALE): string {
  const cached = DATE_FORMATTERS.get(locale)

  if (cached) {
    return cached.format(new Date(value))
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })

  DATE_FORMATTERS.set(locale, formatter)

  return formatter.format(new Date(value))
}
