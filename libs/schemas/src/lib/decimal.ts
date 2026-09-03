import { z } from 'zod'

const DECIMAL_PATTERN = /^-?(\d+([.]\d*)?|[.]\d+)$/

export function parseDecimal(raw: string): number {
  const trimmed = raw.trim()

  return DECIMAL_PATTERN.test(trimmed) ? Number(trimmed) : Number.NaN
}

export function decimalField(schema: z.ZodNumber) {
  return z.string().transform(parseDecimal).pipe(schema)
}
