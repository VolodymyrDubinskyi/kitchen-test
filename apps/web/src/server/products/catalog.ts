import { productPageSchema, type Product } from '@kitchen/schemas'

import { requestUpstream } from '../dummyjson/request'

const CACHE_TTL_MS = 60_000
const CACHE_KEY = Symbol.for('kitchen.product-catalog-cache')

type Cache = { products: Product[]; loadedAt: number }
type CacheHolder = { [CACHE_KEY]?: Cache }

export async function loadCatalog(): Promise<Product[]> {
  const holder = globalThis as CacheHolder
  const cached = holder[CACHE_KEY]

  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
    return cached.products
  }

  const page = await requestUpstream('/products?limit=0', productPageSchema)

  holder[CACHE_KEY] = { products: page.products, loadedAt: Date.now() }

  return page.products
}

export function clearCatalogCache(): void {
  delete (globalThis as CacheHolder)[CACHE_KEY]
}
