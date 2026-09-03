import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { productListParamsSchema, type ProductListParams } from '@kitchen/schemas'

import { useDebouncedValue } from '../../../shared/hooks/use-debounced-value'
import { LIST_PATHNAME, listQuery } from './list-route'

export const SEARCH_DEBOUNCE_MS = 350

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
    if (debouncedSearch === urlSearch || debouncedSearch !== searchInput.trim()) {
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
  }, [debouncedSearch, searchInput, urlSearch, router])

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
