import type { ProductListParams } from '@kitchen/schemas'

export const LIST_PATHNAME = '/'

export function listQuery(params: ProductListParams): Record<string, string> {
  const query: Record<string, string> = {}

  if (params.page > 1) {
    query.page = String(params.page)
  }

  if (params.search) {
    query.search = params.search
  }

  return query
}

export function listHref(params: ProductListParams): string {
  const query = new URLSearchParams(listQuery(params)).toString()

  return query ? `${LIST_PATHNAME}?${query}` : LIST_PATHNAME
}
