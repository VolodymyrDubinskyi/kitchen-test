import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NumberField, parseDecimal } from './field'

describe('parseDecimal', () => {
  it.each([
    ['a plain number', '19.99', 19.99],
    ['a comma separator', '19,99', 19.99],
    ['surrounding spaces', '  7 ', 7],
    ['a space as a group separator', '1 299,99', 1299.99],
    ['a non-breaking space group separator', '1\u00a0299,99', 1299.99],
    ['a trailing separator, still being typed', '12.', 12],
    ['a leading separator', '.5', 0.5],
    ['a negative number', '-3', -3],
    ['an empty string', '', undefined],
  ])('reads %s', (_label, raw, expected) => {
    expect(parseDecimal(raw)).toBe(expected)
  })

  it.each([
    ['plain text', 'abc'],
    ['exponent notation, which no price field should silently accept', '1e3'],
    ['hexadecimal', '0x10'],
    ['an ambiguous mix of separators', '1,299.99'],
    ['two decimal points', '1.2.3'],
    ['a lone minus sign', '-'],
    ['infinity', 'Infinity'],
  ])('rejects %s', (_label, raw) => {
    expect(parseDecimal(raw)).toBeNaN()
  })
})

describe('NumberField', () => {
  it('renders the value it is given', () => {
    render(
      <NumberField
        label="Price"
        name="price"
        value={12.5}
        onValueChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Price')).toHaveValue('12.5')
  })

  it('reports the parsed number as the user types', () => {
    const onValueChange = vi.fn()

    render(
      <NumberField
        label="Price"
        name="price"
        value={undefined}
        onValueChange={onValueChange}
        onBlur={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '19,99' } })

    expect(onValueChange).toHaveBeenCalledWith(19.99)
    expect(screen.getByLabelText('Price')).toHaveValue('19,99')
  })

  it('follows the form when the value is changed from outside', () => {
    const { rerender } = render(
      <NumberField label="Price" name="price" value={1} onValueChange={vi.fn()} onBlur={vi.fn()} />,
    )

    rerender(
      <NumberField
        label="Price"
        name="price"
        value={42}
        onValueChange={vi.fn()}
        onBlur={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Price')).toHaveValue('42')
  })

  it('does not rewrite what the user typed when it already means the same number', () => {
    const onValueChange = vi.fn()

    const { rerender } = render(
      <NumberField
        label="Price"
        name="price"
        value={undefined}
        onValueChange={onValueChange}
        onBlur={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '19,99' } })
    rerender(
      <NumberField
        label="Price"
        name="price"
        value={19.99}
        onValueChange={onValueChange}
        onBlur={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Price')).toHaveValue('19,99')
  })
})
