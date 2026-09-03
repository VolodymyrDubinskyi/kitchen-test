import {
  productPageSchema,
  PRODUCTS_PAGE_SIZE,
  productSchema,
  productWriteResponseSchema,
  type Product,
  type ProductInput,
  type ProductListParams,
  type ProductPage,
} from '@kitchen/schemas'

import { requestUpstream } from './request'

function listPath({ page, search }: ProductListParams): string {
  const query = new URLSearchParams({
    limit: String(PRODUCTS_PAGE_SIZE),
    skip: String((page - 1) * PRODUCTS_PAGE_SIZE),
  })

  if (!search) {
    return `/products?${query}`
  }

  query.set('q', search)

  return `/products/search?${query}`
}

export function fetchProductPage(params: ProductListParams): Promise<ProductPage> {
  return requestUpstream(listPath(params), productPageSchema)
}

export function fetchProduct(id: number): Promise<Product> {
  return requestUpstream(`/products/${id}`, productSchema)
}

export function createProduct(input: ProductInput) {
  return requestUpstream('/products/add', productWriteResponseSchema, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateProduct(id: number, input: ProductInput) {
  return requestUpstream(`/products/${id}`, productWriteResponseSchema, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteProduct(id: number) {
  return requestUpstream(`/products/${id}`, productWriteResponseSchema, { method: 'DELETE' })
}
