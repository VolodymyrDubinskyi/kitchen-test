import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { productPageSchema } from '@kitchen/schemas'
import { server, UPSTREAM_BASE_URL } from '@kitchen/testing'
import { ApiError } from '@kitchen/utils'

import { requestUpstream } from './request'

const productsUrl = `${UPSTREAM_BASE_URL}/products`

describe('requestUpstream', () => {
  it('returns the parsed payload when upstream matches the schema', async () => {
    const page = await requestUpstream('/products', productPageSchema)

    expect(page.products).toHaveLength(2)
    expect(page.total).toBe(194)
    expect(page.products[0].title).toBe('Essence Mascara Lash Princess')
  })

  it('preserves the upstream status on a failed response', async () => {
    server.use(http.get(productsUrl, () => new HttpResponse(null, { status: 404 })))

    await expect(requestUpstream('/products', productPageSchema)).rejects.toMatchObject({
      status: 404,
    })
  })

  it('surfaces the message the upstream sent instead of a bare status', async () => {
    server.use(
      http.get(productsUrl, () =>
        HttpResponse.json({ message: "Product with id '9999' not found" }, { status: 404 }),
      ),
    )

    await expect(requestUpstream('/products', productPageSchema)).rejects.toMatchObject({
      status: 404,
      message: "Product with id '9999' not found",
    })
  })

  it('fails with 502 when the body is not valid JSON', async () => {
    server.use(http.get(productsUrl, () => new HttpResponse('<html>gateway</html>')))

    await expect(requestUpstream('/products', productPageSchema)).rejects.toMatchObject({
      status: 502,
      message: 'The product service returned a malformed response',
    })
  })

  it('fails with 502 and logs the issues when the payload does not match the schema', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    server.use(http.get(productsUrl, () => HttpResponse.json({ unexpected: true })))

    const error = await requestUpstream('/products', productPageSchema).catch(reason => reason)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 502 })
    expect(logged).toHaveBeenCalledOnce()
    logged.mockRestore()
  })

  it('propagates the caller abort instead of masking it as an upstream failure', async () => {
    const controller = new AbortController()
    controller.abort()

    const error = await requestUpstream('/products', productPageSchema, {
      signal: controller.signal,
    }).catch(reason => reason)

    expect(error).not.toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ name: 'AbortError' })
  })
})
