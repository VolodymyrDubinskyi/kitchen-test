import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import type { Product } from '@kitchen/schemas'
import { product as capturedProduct, server } from '@kitchen/testing'

import { ToastProvider } from '../../../shared/toast/toast-context'
import { createTestI18n } from '../../../tests/render'
import { useProductDeletion } from './use-product-deletion'

const first = { ...(capturedProduct as Product), id: 1, title: 'First' }
const second = { ...(capturedProduct as Product), id: 2, title: 'Second' }
const products = [first, second]

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return (
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={createTestI18n()}>
        <ToastProvider>{children}</ToastProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

function setup() {
  return renderHook(() => useProductDeletion(products), { wrapper })
}

describe('useProductDeletion', () => {
  it('starts with nothing pending', () => {
    const { result } = setup()

    expect(result.current.pending).toBeNull()
  })

  it('resolves the requested id to the product being deleted', () => {
    const { result } = setup()

    act(() => result.current.request(2))

    expect(result.current.pending).toEqual(second)
  })

  it('reports nothing pending for an id that is not on the page', () => {
    const { result } = setup()

    act(() => result.current.request(999))

    expect(result.current.pending).toBeNull()
  })

  it('clears the request on cancel', () => {
    const { result } = setup()

    act(() => result.current.request(1))
    act(() => result.current.cancel())

    expect(result.current.pending).toBeNull()
  })

  it('deletes the pending product and clears the request afterwards', async () => {
    const deleted = vi.fn()

    server.use(
      http.delete('/api/products/:id', ({ params }) => {
        deleted(params.id)

        return HttpResponse.json(first)
      }),
    )

    const { result } = setup()

    act(() => result.current.request(1))
    act(() => result.current.confirm())

    await waitFor(() => expect(deleted).toHaveBeenCalledWith('1'))
    await waitFor(() => expect(result.current.pending).toBeNull())
  })

  it('clears the request even when the delete fails, so the dialog cannot get stuck', async () => {
    server.use(http.delete('/api/products/:id', () => new HttpResponse(null, { status: 500 })))

    const { result } = setup()

    act(() => result.current.request(1))
    act(() => result.current.confirm())

    await waitFor(() => expect(result.current.pending).toBeNull())
  })

  it('does nothing when confirmed with no request outstanding', () => {
    const deleted = vi.fn()

    server.use(
      http.delete('/api/products/:id', () => {
        deleted()

        return HttpResponse.json(first)
      }),
    )

    const { result } = setup()

    act(() => result.current.confirm())

    expect(deleted).not.toHaveBeenCalled()
  })

  it('marks only the product being deleted as in flight', async () => {
    let release = () => undefined as void
    const inFlight = new Promise<void>(resolve => {
      release = () => resolve()
    })

    server.use(
      http.delete('/api/products/:id', async () => {
        await inFlight

        return HttpResponse.json(first)
      }),
    )

    const { result } = setup()

    act(() => result.current.request(1))
    act(() => result.current.confirm())

    await waitFor(() => expect(result.current.isDeleting(1)).toBe(true))

    expect(result.current.isDeleting(2)).toBe(false)

    release()

    await waitFor(() => expect(result.current.pending).toBeNull())
  })
})
