import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { decimalField, parseDecimal } from './decimal'

describe('parseDecimal', () => {
  it.each([
    ['a plain number', '19.99', 19.99],
    ['surrounding spaces', '  7 ', 7],
    ['a trailing separator, still being typed', '12.', 12],
    ['a leading separator', '.5', 0.5],
    ['a negative number', '-3', -3],
    ['zero', '0', 0],
  ])('reads %s', (_label, raw, expected) => {
    expect(parseDecimal(raw)).toBe(expected)
  })

  it.each([
    ['an empty string', ''],
    ['only whitespace', '   '],
    ['plain text', 'abc'],
    ['a comma separator, which this app does not accept', '19,99'],
    ['exponent notation, which no price field should silently accept', '1e3'],
    ['hexadecimal', '0x10'],
    ['two decimal points', '1.2.3'],
    ['a lone minus sign', '-'],
    ['infinity', 'Infinity'],
  ])('refuses %s', (_label, raw) => {
    expect(parseDecimal(raw)).toBeNaN()
  })
})

describe('decimalField', () => {
  const price = decimalField(
    z.number({ error: 'Price must be a number' }).positive('Price must be greater than 0'),
  )

  it('turns the typed string into a number', () => {
    expect(price.parse('19.99')).toBe(19.99)
  })

  it('explains unreadable input in words rather than type jargon', () => {
    const result = price.safeParse('abc')

    expect(result.error?.issues[0]?.message).toBe('Price must be a number')
  })

  it('still applies the numeric rules after conversion', () => {
    const result = price.safeParse('0')

    expect(result.error?.issues[0]?.message).toBe('Price must be greater than 0')
  })
})
