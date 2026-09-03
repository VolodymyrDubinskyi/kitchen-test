import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { Product, ProductInput } from '@kitchen/schemas'
import { product as capturedProduct, server, UPSTREAM_BASE_URL } from '@kitchen/testing'
import { ApiError } from '@kitchen/utils'

import { clearCatalogCache } from './catalog'
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

function serveCatalog(count: number) {
  const products = Array.from({ length: count }, (_item, index) => ({
    ...template,
    id: index + 1,
    title: `Upstream product ${index + 1}`,
  }))

  server.use(
    http.get(`${UPSTREAM_BASE_URL}/products`, () =>
      HttpResponse.json({ products, total: products.length, skip: 0, limit: products.length }),
    ),
  )
}

beforeEach(() => {
  resetMutationStore()
  clearCatalogCache()
  serveCatalog(30)
})

afterEach(() => {
  resetMutationStore()
  clearCatalogCache()
})

describe('listProducts', () => {
  it('paginates the upstream catalogue', async () => {
    const first = await listProducts({ page: 1 })
    const second = await listProducts({ page: 2 })

    expect(first.products).toHaveLength(12)
    expect(first.total).toBe(30)
    expect(first.products[0]?.id).not.toBe(second.products[0]?.id)
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

  it('counts pages against the filtered set, not the whole catalogue', async () => {
    const result = await listProducts({ page: 1, search: 'product 7' })

    expect(result.pageCount).toBe(1)
    expect(result.total).toBe(1)
  })

  it('never reports fewer than one page, even with no matches', async () => {
    const result = await listProducts({ page: 4, search: 'nothing matches this' })

    expect(result.pageCount).toBe(1)
    expect(result.page).toBe(1)
    expect(result.products).toHaveLength(0)
  })

  it('searches across title, description and category', async () => {
    const result = await listProducts({ page: 1, search: 'product 7' })

    expect(result.products.map(product => product.title)).toEqual(['Upstream product 7'])
    expect(result.total).toBe(1)
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

  it('makes the product visible in the list and countable in the total', async () => {
    const created = await createProduct(input)
    const page = await listProducts({ page: 1 })

    expect(page.products[0]).toEqual(created)
    expect(page.total).toBe(31)
  })

  it('never reuses an upstream id, nor the id upstream echoes back', async () => {
    const created = await createProduct(input)

    expect(created.id).toBeGreaterThan(30)
  })

  it('hands out a fresh id after a delete', async () => {
    const first = await createProduct(input)
    await deleteProduct(first.id)
    const second = await createProduct(input)

    expect(second.id).not.toBe(first.id)
  })

  it('keeps the page size honest', async () => {
    await createProduct(input)

    const page = await listProducts({ page: 1 })

    expect(page.products).toHaveLength(12)
    expect(page.total).toBe(31)
  })

  it('surfaces the created product to a matching search', async () => {
    await createProduct(input)

    const page = await listProducts({ page: 1, search: 'Service Test' })

    expect(page.products.map(product => product.title)).toEqual(['Service Test Product'])
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
