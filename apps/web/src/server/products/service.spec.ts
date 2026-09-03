import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { Product, ProductInput } from '@kitchen/schemas'
import { product as capturedProduct, server, UPSTREAM_BASE_URL } from '@kitchen/testing'
import { ApiError } from '@kitchen/utils'

import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from './service'
import { resetMutationStore } from './store'

const template = capturedProduct as Product

const input: ProductInput = {
  title: 'Service Test Product',
  description: 'Written through the service layer',
  category: 'beauty',
  price: 4.5,
  stock: 9,
  brand: 'ACME',
  thumbnail: 'https://cdn.dummyjson.com/service.webp',
}

// Stands in for dummyJSON: honours limit/skip and q so the tests exercise the
// real division of labour, where upstream pages and searches, not the service.
function serveCatalog(count: number) {
  const products = Array.from({ length: count }, (_item, index) => ({
    ...template,
    id: index + 1,
    title: `Upstream product ${index + 1}`,
  }))

  const servePage = ({ request }: { request: Request }) => {
    const query = new URL(request.url).searchParams
    const needle = query.get('q')?.toLowerCase()
    const skip = Number(query.get('skip') ?? 0)
    const limit = Number(query.get('limit') ?? products.length)
    const matching = needle
      ? products.filter(product => product.title.toLowerCase().includes(needle))
      : products
    const window = matching.slice(skip, skip + limit)

    return HttpResponse.json({
      products: window,
      total: matching.length,
      skip,
      limit: window.length,
    })
  }

  server.use(
    http.get(`${UPSTREAM_BASE_URL}/products`, servePage),
    http.get(`${UPSTREAM_BASE_URL}/products/search`, servePage),
    http.get(`${UPSTREAM_BASE_URL}/products/:id`, ({ params }) => {
      const found = products.find(product => product.id === Number(params.id))

      return found
        ? HttpResponse.json(found)
        : HttpResponse.json(
            { message: `Product with id '${params.id}' not found` },
            { status: 404 },
          )
    }),
  )
}

beforeEach(() => {
  resetMutationStore()
  serveCatalog(30)
})

afterEach(() => {
  resetMutationStore()
})

describe('listProducts', () => {
  it('lets upstream do the paging instead of slicing a full catalogue', async () => {
    const first = await listProducts({ page: 1 })
    const second = await listProducts({ page: 2 })

    expect(first.products.map(product => product.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
    expect(second.products.map(product => product.id)).toEqual([
      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    ])
  })

  it('reports which page it actually served and how many there are', async () => {
    const result = await listProducts({ page: 2 })

    expect(result.page).toBe(2)
    expect(result.pageCount).toBe(3)
    expect(result.total).toBe(30)
  })

  it('clamps a page past the end instead of serving nothing', async () => {
    const result = await listProducts({ page: 99999 })

    expect(result.page).toBe(3)
    expect(result.products).toHaveLength(6)
  })

  it('lets upstream do the searching too', async () => {
    const result = await listProducts({ page: 1, search: 'product 7' })

    expect(result.products.map(product => product.title)).toEqual(['Upstream product 7'])
    expect(result.total).toBe(1)
    expect(result.pageCount).toBe(1)
  })

  it('never reports fewer than one page, even with no matches', async () => {
    const result = await listProducts({ page: 4, search: 'nothing matches this' })

    expect(result.pageCount).toBe(1)
    expect(result.page).toBe(1)
    expect(result.products).toHaveLength(0)
  })
})

describe('createProduct', () => {
  it('still sends the write upstream even though the result is not trusted', async () => {
    let sent = false

    server.use(
      http.post(`${UPSTREAM_BASE_URL}/products/add`, () => {
        sent = true

        return HttpResponse.json({ id: 195, title: input.title })
      }),
    )

    await createProduct(input)

    expect(sent).toBe(true)
  })

  it('shows the product on the first page and counts it in the total', async () => {
    const created = await createProduct(input)
    const page = await listProducts({ page: 1 })

    expect(page.products[0]).toEqual(created)
    expect(page.total).toBe(31)
  })

  it('leaves later pages alone rather than shifting the whole catalogue', async () => {
    await createProduct(input)

    const second = await listProducts({ page: 2 })

    expect(second.products.map(product => product.id)).toEqual([
      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    ])
  })

  it('never reuses an upstream id, nor the id upstream echoes back', async () => {
    const created = await createProduct(input)

    expect(created.id).toBeGreaterThan(195)
  })

  it('hands out a fresh id after a delete', async () => {
    const first = await createProduct(input)
    await deleteProduct(first.id)
    const second = await createProduct(input)

    expect(second.id).not.toBe(first.id)
  })

  it('surfaces the created product to a matching search', async () => {
    await createProduct(input)

    const page = await listProducts({ page: 1, search: 'Service Test' })

    expect(page.products.map(product => product.title)).toEqual(['Service Test Product'])
    expect(page.total).toBe(1)
  })
})

describe('updateProduct', () => {
  it('keeps fields the form does not carry', async () => {
    const updated = await updateProduct(1, { ...input, title: 'Renamed' })

    expect(updated.title).toBe('Renamed')
    expect(updated.rating).toBe(template.rating)
    expect(updated.id).toBe(1)
  })

  it('serves the updated product from the list and by id', async () => {
    await updateProduct(1, { ...input, title: 'Renamed' })

    const page = await listProducts({ page: 1 })

    expect(page.products.find(product => product.id === 1)?.title).toBe('Renamed')
    expect((await getProduct(1)).title).toBe('Renamed')
  })

  it('rejects an unknown id', async () => {
    await expect(updateProduct(9999, input)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('deleteProduct', () => {
  it('removes the product from the list and adjusts the total', async () => {
    await deleteProduct(1)

    const page = await listProducts({ page: 1 })

    expect(page.products.map(product => product.id)).not.toContain(1)
    expect(page.total).toBe(29)
  })

  it('thins the page it was on instead of pulling an item back from the next one', async () => {
    await deleteProduct(1)

    const first = await listProducts({ page: 1 })

    expect(first.products).toHaveLength(11)
    expect(first.pageCount).toBe(3)
  })

  it('makes the product a 404 afterwards', async () => {
    await deleteProduct(1)

    await expect(getProduct(1)).rejects.toMatchObject({ status: 404 })
  })

  it('drops a pending update when the product is deleted', async () => {
    await updateProduct(1, { ...input, title: 'Renamed' })
    await deleteProduct(1)

    await expect(getProduct(1)).rejects.toMatchObject({ status: 404 })
  })

  it('deletes a locally created product without calling upstream', async () => {
    const created = await createProduct(input)

    server.use(http.delete(`${UPSTREAM_BASE_URL}/products/:id`, () => HttpResponse.error()))

    await deleteProduct(created.id)

    await expect(getProduct(created.id)).rejects.toMatchObject({ status: 404 })
  })
})
