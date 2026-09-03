import { createInstance } from 'i18next'
import { describe, expect, it } from 'vitest'

import { productInputSchema, VALIDATION_LIMITS } from '@kitchen/schemas'

import en from '../../public/locales/en/common.json'
import uk from '../../public/locales/uk/common.json'

const valid = {
  title: 'Lash Princess Mascara',
  description: 'A volumising mascara that does not clump.',
  category: 'beauty',
  price: 9.99,
  stock: 12,
  brand: 'Essence',
  thumbnail: 'https://cdn.dummyjson.com/thumbnail.webp',
}

const breaking: Record<string, unknown>[] = [
  { title: 'a', description: '', category: '', thumbnail: 'nope', price: undefined },
  { title: 'x'.repeat(1000), description: 'x'.repeat(5000), brand: 'x'.repeat(200) },
  { price: 0, stock: 1.5 },
  { stock: -1 },
  { stock: undefined },
]

function emittedKeys(): string[] {
  const keys = breaking.flatMap(
    override =>
      productInputSchema.safeParse({ ...valid, ...override }).error?.issues.map(i => i.message) ??
      [],
  )

  return [...new Set(keys)].sort()
}

function translator(locale: string, resources: Record<string, unknown>) {
  const instance = createInstance()

  void instance.init({
    lng: locale,
    ns: ['common'],
    defaultNS: 'common',
    resources: { [locale]: { common: resources } },
    interpolation: { escapeValue: false },
  })

  return instance
}

describe('validation messages', () => {
  it('leaves the wording to the locale and emits keys only', () => {
    const keys = emittedKeys()

    expect(keys.length).toBeGreaterThanOrEqual(12)
    expect(keys.every(key => key.startsWith('validation.'))).toBe(true)
  })

  it.each([
    ['en', en],
    ['uk', uk],
  ])('translates every key in %s, with no placeholder left unfilled', (locale, resources) => {
    const t = translator(locale, resources)

    for (const key of emittedKeys()) {
      const text = t.t(key, VALIDATION_LIMITS)

      expect(text, `${key} is missing from ${locale}`).not.toBe(key)
      expect(text, `${key} has an unfilled placeholder in ${locale}`).not.toContain('{{')
    }
  })
})
