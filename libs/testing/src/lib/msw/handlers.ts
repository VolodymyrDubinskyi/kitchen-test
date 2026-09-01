import { http, HttpResponse } from 'msw'

import { productPage } from '../captures'

export const UPSTREAM_BASE_URL = process.env.DUMMYJSON_BASE_URL ?? 'https://dummyjson.com'

export const handlers = [
  http.get(`${UPSTREAM_BASE_URL}/products`, () => HttpResponse.json(productPage)),
]
