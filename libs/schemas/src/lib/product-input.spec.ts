import { describe, expect, it } from 'vitest'

import {
  BRAND_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  productFormSchema,
  productInputSchema,
  TITLE_MAX_LENGTH,
  toProductFormValues,
} from './product-input'

const validInput = {
  title: 'Lash Princess Mascara',
  description: 'A volumising mascara that does not clump.',
  category: 'beauty',
  price: 9.99,
  stock: 12,
  brand: 'Essence',
  thumbnail: 'https://cdn.dummyjson.com/thumbnail.webp',
}

function messagesFor(input: Record<string, unknown>): string[] {
  const result = productInputSchema.safeParse(input)

  return result.error?.issues.map(issue => issue.message) ?? []
}

describe('productInputSchema', () => {
  it('accepts a filled-in form', () => {
    expect(productInputSchema.parse(validInput)).toEqual(validInput)
  })

  it('trims the text the user typed', () => {
    const result = productInputSchema.parse({
      ...validInput,
      title: '  Lash Princess Mascara  ',
      category: '  beauty  ',
      brand: '  Essence  ',
    })

    expect(result.title).toBe('Lash Princess Mascara')
    expect(result.category).toBe('beauty')
    expect(result.brand).toBe('Essence')
  })

  it('drops fields the form has no business sending', () => {
    const result = productInputSchema.parse({ ...validInput, id: 195, rating: 5 })

    expect(result).not.toHaveProperty('id')
    expect(result).not.toHaveProperty('rating')
  })

  it('measures length after trimming, so whitespace cannot pass for content', () => {
    expect(messagesFor({ ...validInput, title: '  a  ' })).toContain(
      'Title must be at least 2 characters',
    )
    expect(messagesFor({ ...validInput, category: '   ' })).toContain('Category is required')
  })

  it.each([
    ['one character below the minimum', 'a', false],
    ['exactly the minimum', 'ab', true],
    ['exactly the maximum', 'x'.repeat(TITLE_MAX_LENGTH), true],
    ['one character above the maximum', 'x'.repeat(TITLE_MAX_LENGTH + 1), false],
  ])('handles a title of %s', (_label, title, expected) => {
    expect(productInputSchema.safeParse({ ...validInput, title }).success).toBe(expected)
  })

  it.each([
    ['one character below the minimum', DESCRIPTION_MIN_LENGTH - 1, false],
    ['exactly the minimum', DESCRIPTION_MIN_LENGTH, true],
  ])('handles a description of %s', (_label, length, expected) => {
    const description = 'x'.repeat(length)

    expect(productInputSchema.safeParse({ ...validInput, description }).success).toBe(expected)
  })

  it.each([
    ['zero', 0],
    ['a negative amount', -0.01],
  ])('rejects a price of %s', (_label, price) => {
    expect(messagesFor({ ...validInput, price })).toContain('Price must be greater than 0')
  })

  it('rejects a fractional stock count but accepts zero', () => {
    expect(messagesFor({ ...validInput, stock: 1.5 })).toContain('Stock must be a whole number')
    expect(messagesFor({ ...validInput, stock: -1 })).toContain('Stock cannot be negative')
    expect(productInputSchema.safeParse({ ...validInput, stock: 0 }).success).toBe(true)
  })

  it('treats brand as optional and caps its length', () => {
    const { brand, ...withoutBrand } = validInput

    expect(brand).toBeDefined()
    expect(productInputSchema.safeParse(withoutBrand).success).toBe(true)
    expect(
      productInputSchema.safeParse({ ...validInput, brand: 'x'.repeat(BRAND_MAX_LENGTH) }).success,
    ).toBe(true)
    expect(
      productInputSchema.safeParse({ ...validInput, brand: 'x'.repeat(BRAND_MAX_LENGTH + 1) })
        .success,
    ).toBe(false)
  })

  it.each([
    ['an uploaded image path', '/api/uploads/2f1c7d9e-4a3b-4c5d-8e6f-0a1b2c3d4e5f'],
    ['an https url', 'https://cdn.dummyjson.com/x.webp'],
  ])('accepts %s as a thumbnail', (_label, thumbnail) => {
    expect(productInputSchema.safeParse({ ...validInput, thumbnail }).success).toBe(true)
  })

  it.each([
    ['a javascript: url', 'javascript:alert(1)'],
    ['a data: url', 'data:image/png;base64,AAAA'],
    ['an arbitrary relative path', '/images/thumb.png'],
    ['an upload path with a forged id', '/api/uploads/../../etc/passwd'],
    ['plain text', 'not a url'],
  ])('rejects %s as a thumbnail', (_label, thumbnail) => {
    expect(messagesFor({ ...validInput, thumbnail })).toContain(
      'Thumbnail must be an http or https URL, or an uploaded image',
    )
  })

  it.each([
    ['an empty number input', undefined],
    ['text typed into a number input', 'abc'],
  ])('explains %s in words rather than type jargon', (_label, price) => {
    expect(messagesFor({ ...validInput, price })).toContain('Price must be a number')
  })

  it('reports every invalid field at once, not just the first', () => {
    const messages = messagesFor({
      title: '',
      description: '',
      category: '',
      price: -1,
      stock: 1.5,
    })

    expect(messages.length).toBeGreaterThanOrEqual(5)
  })
})

describe('toProductFormValues', () => {
  const product = {
    id: 3,
    title: 'Powder Canister',
    description: 'A finely milled setting powder.',
    category: 'beauty',
    price: 14.99,
    stock: 89,
    brand: 'Velvet Touch',
    thumbnail: 'https://cdn.dummyjson.com/powder.webp',
    rating: 4.64,
    images: ['https://cdn.dummyjson.com/powder-1.webp'],
  }

  it('renders numbers as the strings the inputs will hold', () => {
    const values = toProductFormValues(product)

    expect(values.price).toBe('14.99')
    expect(values.stock).toBe('89')
  })

  it('round-trips back to the same numbers through the form schema', () => {
    const parsed = productFormSchema.parse(toProductFormValues(product))

    expect(parsed.price).toBe(product.price)
    expect(parsed.stock).toBe(product.stock)
    expect(parsed.title).toBe(product.title)
  })

  it('drops the fields the form has no business carrying', () => {
    const values = toProductFormValues(product)

    expect(values).not.toHaveProperty('id')
    expect(values).not.toHaveProperty('rating')
    expect(values).not.toHaveProperty('images')
  })

  it('produces an empty form when given nothing', () => {
    expect(toProductFormValues()).toEqual({
      title: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      brand: '',
      thumbnail: '',
    })
  })
})
