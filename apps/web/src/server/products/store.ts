import type { Product, ProductInput } from '@kitchen/schemas'

export type MutationStore = {
  created: Product[]
  updated: Map<number, Product>
  deleted: Set<number>
  lastId: number
}

const STORE_KEY = Symbol.for('kitchen.product-mutation-store')

type StoreHolder = { [STORE_KEY]?: MutationStore }

function emptyStore(): MutationStore {
  return { created: [], updated: new Map(), deleted: new Set(), lastId: 0 }
}

export function mutationStore(): MutationStore {
  const holder = globalThis as StoreHolder

  holder[STORE_KEY] ??= emptyStore()

  return holder[STORE_KEY]
}

export function resetMutationStore(): void {
  ;(globalThis as StoreHolder)[STORE_KEY] = emptyStore()
}

export function isLocallyCreated(id: number): boolean {
  return mutationStore().created.some(product => product.id === id)
}

export function recordCreated(input: ProductInput, floorId: number): Product {
  const store = mutationStore()
  const id = Math.max(store.lastId, floorId) + 1

  const product: Product = {
    id,
    title: input.title,
    description: input.description,
    category: input.category,
    price: input.price,
    stock: input.stock,
    brand: input.brand,
    thumbnail: input.thumbnail,
    rating: 0,
    images: [],
  }

  store.created.unshift(product)
  store.lastId = id

  return product
}

export function recordUpdated(current: Product, input: ProductInput): Product {
  const store = mutationStore()
  const next: Product = { ...current, ...input, id: current.id }
  const index = store.created.findIndex(product => product.id === current.id)

  if (index >= 0) {
    store.created[index] = next
  } else {
    store.updated.set(current.id, next)
  }

  return next
}

export function recordDeleted(product: Product): Product {
  const store = mutationStore()
  const index = store.created.findIndex(created => created.id === product.id)

  if (index >= 0) {
    store.created.splice(index, 1)
  } else {
    store.updated.delete(product.id)
    store.deleted.add(product.id)
  }

  return product
}
