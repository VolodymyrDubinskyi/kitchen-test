import type { ZodType } from 'zod'

import {
  productPageSchema,
  productSchema,
  productWriteResponseSchema,
  type Product,
  type ProductInput,
  type ProductListParams,
  type ProductPage,
  type ProductWriteResponse,
} from '@kitchen/schemas'
import { ApiError } from '@kitchen/utils'

const UNEXPECTED = 502

type ErrorEnvelope = {
  error?: {
    status?: number
    message?: string
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: ErrorEnvelope = await response.json()

    if (typeof body.error?.message === 'string' && body.error.message.length > 0) {
      return body.error.message
    }
  } catch {
    return `Request failed with ${response.status}`
  }

  return `Request failed with ${response.status}`
}

async function request<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = init ?? {}

  const response = await fetch(`/api${path}`, {
    ...rest,
    headers: { 'content-type': 'application/json', ...rest.headers },
    body: json === undefined ? rest.body : JSON.stringify(json),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }

  const parsed = schema.safeParse(await response.json())

  if (!parsed.success) {
    throw new ApiError(UNEXPECTED, 'The server returned an unexpected payload')
  }

  return parsed.data
}

function listQuery({ page, search }: ProductListParams): string {
  const params = new URLSearchParams({ page: String(page) })

  if (search) {
    params.set('search', search)
  }

  return params.toString()
}

export function fetchProductPage(
  params: ProductListParams,
  signal?: AbortSignal,
): Promise<ProductPage> {
  return request(`/products?${listQuery(params)}`, productPageSchema, { signal })
}

export function fetchProduct(id: number, signal?: AbortSignal): Promise<Product> {
  return request(`/products/${id}`, productSchema, { signal })
}

export function createProduct(input: ProductInput): Promise<ProductWriteResponse> {
  return request('/products', productWriteResponseSchema, { method: 'POST', json: input })
}

export function updateProduct(id: number, input: ProductInput): Promise<ProductWriteResponse> {
  return request(`/products/${id}`, productWriteResponseSchema, { method: 'PUT', json: input })
}

export function deleteProduct(id: number): Promise<ProductWriteResponse> {
  return request(`/products/${id}`, productWriteResponseSchema, { method: 'DELETE' })
}
