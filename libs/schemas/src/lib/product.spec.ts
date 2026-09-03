import { describe, expect, it } from 'vitest'

import {
  product,
  productCreated,
  productDeleted,
  productPage,
  productUpdated,
} from '@kitchen/testing'

import { productPageSchema, productSchema, productWriteResponseSchema } from './product'

describe('productSchema', () => {
  it('parses a product captured from GET /products/:id', () => {
    const result = productSchema.parse(product)

    expect(result.id).toBe(1)
    expect(result.title).toBe('Essence Mascara Lash Princess')
    expect(result.images.length).toBeGreaterThan(0)
  })

  it('narrows the upstream product to the fields the app uses', () => {
    const result = productSchema.parse(product)

    expect(Object.keys(result).sort()).toEqual([
      'brand',
      'category',
      'description',
      'id',
      'images',
      'price',
      'rating',
      'stock',
      'thumbnail',
      'title',
    ])
    expect(result).not.toHaveProperty('tags')
    expect(result).not.toHaveProperty('reviews')
  })

  it('defaults images to an empty array when upstream omits it', () => {
    const { images, ...withoutImages } = product

    expect(images).toBeDefined()
    expect(productSchema.parse(withoutImages).images).toEqual([])
  })

  it('treats brand as optional, because upstream omits it for some products', () => {
    const { brand, ...withoutBrand } = product

    expect(brand).toBeDefined()
    expect(productSchema.safeParse(withoutBrand).success).toBe(true)
  })

  it('rejects a create response, which carries no rating', () => {
    const result = productSchema.safeParse(productCreated)

    expect(result.success).toBe(false)
    expect(result.error?.issues.map(issue => issue.path.join('.'))).toEqual(['rating'])
  })

  it('accepts an uploaded image path, because the app serves those itself', () => {
    const thumbnail = '/api/uploads/2f1c7d9e-4a3b-4c5d-8e6f-0a1b2c3d4e5f'

    expect(productSchema.safeParse({ ...product, thumbnail }).success).toBe(true)
  })

  it.each([
    ['a javascript: url', 'javascript:alert(1)'],
    ['a data: url', 'data:image/png;base64,AAAA'],
    ['a bare path', '/images/thumb.png'],
  ])('rejects %s as a thumbnail', (_label, thumbnail) => {
    expect(productSchema.safeParse({ ...product, thumbnail }).success).toBe(false)
  })

  it.each([
    ['a rating above the scale', { rating: 5.1 }],
    ['a negative price', { price: -1 }],
    ['a fractional stock count', { stock: 1.5 }],
    ['an empty title', { title: '' }],
  ])('rejects %s', (_label, override) => {
    expect(productSchema.safeParse({ ...product, ...override }).success).toBe(false)
  })
})

describe('productPageSchema', () => {
  it('keeps the page and the collection size apart', () => {
    const result = productPageSchema.parse(productPage)

    expect(result.products).toHaveLength(2)
    expect(result.limit).toBe(2)
    expect(result.total).toBe(194)
    expect(result.skip).toBe(0)
  })

  it('rejects a page whose products do not all parse', () => {
    const broken = { ...productPage, products: [product, { id: 2 }] }

    expect(productPageSchema.safeParse(broken).success).toBe(false)
  })
})

describe('productWriteResponseSchema', () => {
  it('parses a create response, which echoes only the submitted fields', () => {
    const result = productWriteResponseSchema.parse(productCreated)

    expect(result.id).toBe(195)
    expect(result.title).toBe('Fixture Product')
    expect(result.rating).toBeUndefined()
    expect(result.images).toBeUndefined()
  })

  it('parses an update response, which upstream merges with the stored product', () => {
    const result = productWriteResponseSchema.parse(productUpdated)

    expect(result.id).toBe(1)
    expect(result.rating).toBeTypeOf('number')
  })

  it('keeps the deletion markers, which are the only success signal DELETE gives', () => {
    const result = productWriteResponseSchema.parse(productDeleted)

    expect(result.isDeleted).toBe(true)
    expect(result.deletedOn).toEqual(expect.any(String))
  })

  it('still requires an id, because the response is useless without one', () => {
    expect(productWriteResponseSchema.safeParse({ title: 'no id' }).success).toBe(false)
  })

  it('still validates the fields it does receive', () => {
    const result = productWriteResponseSchema.safeParse({ ...productCreated, price: -1 })

    expect(result.success).toBe(false)
  })
})
