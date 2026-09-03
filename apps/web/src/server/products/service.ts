import {
  PRODUCTS_PAGE_SIZE,
  type Product,
  type ProductInput,
  type ProductListParams,
  type ProductListResponse,
} from '@kitchen/schemas'
import { ApiError } from '@kitchen/utils'

import * as upstream from '../dummyjson/products'
import { loadCatalog } from './catalog'
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

async function visibleProducts(): Promise<Product[]> {
  const store = mutationStore()
  const catalog = await loadCatalog()

  const surviving = catalog
    .filter(product => !store.deleted.has(product.id))
    .map(product => store.updated.get(product.id) ?? product)

  return [...store.created, ...surviving]
}

export async function listProducts(params: ProductListParams): Promise<ProductListResponse> {
  const matching = (await visibleProducts()).filter(product => matches(product, params.search))
  const pageCount = Math.max(1, Math.ceil(matching.length / PRODUCTS_PAGE_SIZE))
  const page = Math.min(params.page, pageCount)
  const skip = (page - 1) * PRODUCTS_PAGE_SIZE

  return {
    products: matching.slice(skip, skip + PRODUCTS_PAGE_SIZE),
    total: matching.length,
    page,
    pageCount,
  }
}

export async function getProduct(id: number): Promise<Product> {
  const product = (await visibleProducts()).find(candidate => candidate.id === id)

  if (!product) {
    throw new ApiError(NOT_FOUND, `Product ${id} was not found`)
  }

  return product
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const echoed = await upstream.createProduct(input)
  const catalog = await loadCatalog()
  const highestUpstreamId = catalog.reduce((highest, product) => Math.max(highest, product.id), 0)

  return recordCreated(input, Math.max(highestUpstreamId, echoed.id))
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
