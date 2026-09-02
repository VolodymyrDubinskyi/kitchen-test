import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { productListParamsSchema, type ProductListParams } from '@kitchen/schemas'

import { useDebouncedValue } from '../../../shared/hooks/use-debounced-value'

export const SEARCH_DEBOUNCE_MS = 350

const LIST_PATHNAME = '/'

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

export type ProductListParamsApi = {
  params: ProductListParams
  searchInput: string
  setSearchInput: (value: string) => void
  goToPage: (page: number) => void
}

export function useProductListParams(): ProductListParamsApi {
  const router = useRouter()
  const params = useMemo(() => productListParamsSchema.parse(router.query), [router.query])

  const urlSearch = params.search ?? ''
  const [searchInput, setSearchInput] = useState(urlSearch)
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS)

  if (lastUrlSearch !== urlSearch) {
    setLastUrlSearch(urlSearch)

    if (urlSearch !== searchInput.trim()) {
      setSearchInput(urlSearch)
    }
  }

  useEffect(() => {
    if (debouncedSearch === urlSearch) {
      return
    }

    void router.replace(
      {
        pathname: LIST_PATHNAME,
        query: listQuery({ page: 1, search: debouncedSearch || undefined }),
      },
      undefined,
      { shallow: true, scroll: false },
    )
  }, [debouncedSearch, urlSearch, router])

  const goToPage = useCallback(
    (page: number) => {
      void router.push(
        { pathname: LIST_PATHNAME, query: listQuery({ ...params, page }) },
        undefined,
        { shallow: true, scroll: false },
      )
    },
    [params, router],
  )

  return { params, searchInput, setSearchInput, goToPage }
}
