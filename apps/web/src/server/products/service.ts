import {
  PRODUCTS_PAGE_SIZE,
  type Product,
  type ProductInput,
  type ProductListParams,
  type ProductListResponse,
} from '@kitchen/schemas'
import { ApiError } from '@kitchen/utils'

import * as upstream from '../dummyjson/products'
import {
  isLocallyCreated,
  mutationStore,
  recordCreated,
  recordDeleted,
  recordUpdated,
} from './store'

const NOT_FOUND = 404

function matches(product: Product, search: string | undefined): boolean {
  if (!search) {
    return true
  }

  const needle = search.toLowerCase()

  return (
    product.title.toLowerCase().includes(needle) ||
    product.description.toLowerCase().includes(needle) ||
    product.category.toLowerCase().includes(needle)
  )
}

export async function listProducts(params: ProductListParams): Promise<ProductListResponse> {
  let upstreamPage = await upstream.fetchProductPage(params)

  const pageCount = Math.max(1, Math.ceil(upstreamPage.total / PRODUCTS_PAGE_SIZE))
  const page = Math.min(params.page, pageCount)

  if (page !== params.page) {
    upstreamPage = await upstream.fetchProductPage({ ...params, page })
  }

  const store = mutationStore()
  const created = store.created.filter(product => matches(product, params.search))
  const dropped = [...store.deleted.values()].filter(product => matches(product, params.search))

  const surviving = upstreamPage.products
    .filter(product => !store.deleted.has(product.id))
    .map(product => store.updated.get(product.id) ?? product)

  return {
    products: page === 1 ? [...created, ...surviving] : surviving,
    total: Math.max(0, upstreamPage.total + created.length - dropped.length),
    page,
    pageCount,
  }
}

export async function getProduct(id: number): Promise<Product> {
  const store = mutationStore()

  if (store.deleted.has(id)) {
    throw new ApiError(NOT_FOUND, `Product ${id} was not found`)
  }

  return (
    store.created.find(product => product.id === id) ??
    store.updated.get(id) ??
    upstream.fetchProduct(id)
  )
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const echoed = await upstream.createProduct(input)

  return recordCreated(input, echoed.id)
}

export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  const current = await getProduct(id)

  if (!isLocallyCreated(id)) {
    await upstream.updateProduct(id, input)
  }

  return recordUpdated(current, input)
}

export async function deleteProduct(id: number): Promise<Product> {
  const current = await getProduct(id)

  if (!isLocallyCreated(id)) {
    await upstream.deleteProduct(id)
  }

  return recordDeleted(current)
}
