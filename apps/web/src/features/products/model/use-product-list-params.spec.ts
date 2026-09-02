import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { listQuery, SEARCH_DEBOUNCE_MS, useProductListParams } from './use-product-list-params'

type Navigation = { pathname: string; query: Record<string, string> }

const router = {
  query: {} as Record<string, string>,
  replace: vi.fn((next: Navigation) => {
    router.query = next.query
  }),
  push: vi.fn((next: Navigation) => {
    router.query = next.query
  }),
}

vi.mock('next/router', () => ({ useRouter: () => router }))

function settleDebounce() {
  act(() => {
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  router.query = {}
  router.replace.mockClear()
  router.push.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('listQuery', () => {
  it('omits the first page so the default URL stays clean', () => {
    expect(listQuery({ page: 1 })).toEqual({})
  })

  it('keeps page and search when they carry information', () => {
    expect(listQuery({ page: 3, search: 'lipstick' })).toEqual({ page: '3', search: 'lipstick' })
  })
})

describe('useProductListParams', () => {
  it('reads the parameters out of the URL', () => {
    router.query = { page: '4', search: 'lipstick' }

    const { result } = renderHook(() => useProductListParams())

    expect(result.current.params).toEqual({ page: 4, search: 'lipstick' })
    expect(result.current.searchInput).toBe('lipstick')
  })

  it('falls back to the first page when the URL carries nonsense', () => {
    router.query = { page: 'not-a-page' }

    const { result } = renderHook(() => useProductListParams())

    expect(result.current.params.page).toBe(1)
  })

  it('pushes the typed search into the URL once typing settles', () => {
    const { result } = renderHook(() => useProductListParams())

    act(() => result.current.setSearchInput('  mascara  '))

    expect(router.replace).not.toHaveBeenCalled()

    settleDebounce()

    expect(router.replace).toHaveBeenCalledWith(
      { pathname: '/', query: { search: 'mascara' } },
      undefined,
      { shallow: true, scroll: false },
    )
  })

  it('returns to the first page when the search changes', () => {
    router.query = { page: '5' }

    const { result } = renderHook(() => useProductListParams())

    act(() => result.current.setSearchInput('mascara'))
    settleDebounce()

    expect(router.replace.mock.calls[0]?.[0]).toEqual({
      pathname: '/',
      query: { search: 'mascara' },
    })
  })

  it('does not touch the URL when the input already matches it', () => {
    router.query = { search: 'mascara' }

    const { result } = renderHook(() => useProductListParams())

    act(() => result.current.setSearchInput('mascara'))
    settleDebounce()

    expect(router.replace).not.toHaveBeenCalled()
  })

  it('follows the URL when it changes elsewhere, such as the back button', () => {
    router.query = { search: 'mascara' }

    const { result, rerender } = renderHook(() => useProductListParams())

    expect(result.current.searchInput).toBe('mascara')

    router.query = { search: 'lipstick' }
    rerender()

    expect(result.current.searchInput).toBe('lipstick')
  })

  it('leaves the trailing space alone while the user is still typing a second word', () => {
    const { result, rerender } = renderHook(() => useProductListParams())

    act(() => result.current.setSearchInput('red '))
    settleDebounce()
    rerender()

    expect(router.query).toEqual({ search: 'red' })
    expect(result.current.searchInput).toBe('red ')

    act(() => result.current.setSearchInput('red lipstick'))
    settleDebounce()
    rerender()

    expect(result.current.searchInput).toBe('red lipstick')
    expect(router.query).toEqual({ search: 'red lipstick' })
  })

  it('settles instead of ping-ponging between the URL and the input', () => {
    const { result, rerender } = renderHook(() => useProductListParams())

    act(() => result.current.setSearchInput('  mascara  '))
    settleDebounce()
    rerender()
    settleDebounce()
    rerender()

    expect(router.replace).toHaveBeenCalledTimes(1)
    expect(result.current.searchInput).toBe('  mascara  ')
  })

  it('adds a history entry when paging, so back returns to the previous page', () => {
    router.query = { search: 'lipstick' }

    const { result } = renderHook(() => useProductListParams())

    act(() => result.current.goToPage(3))

    expect(router.push).toHaveBeenCalledWith(
      { pathname: '/', query: { page: '3', search: 'lipstick' } },
      undefined,
      { shallow: true, scroll: false },
    )
  })
})
