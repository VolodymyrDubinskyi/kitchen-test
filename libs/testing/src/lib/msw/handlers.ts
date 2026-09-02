import { http, HttpResponse } from 'msw'

import { productCreated, productPage } from '../captures'

export const UPSTREAM_BASE_URL = process.env.DUMMYJSON_BASE_URL ?? 'https://dummyjson.com'

export const handlers = [
  http.get(`${UPSTREAM_BASE_URL}/products`, () => HttpResponse.json(productPage)),
  http.post(`${UPSTREAM_BASE_URL}/products/add`, () => HttpResponse.json(productCreated)),
  http.put(`${UPSTREAM_BASE_URL}/products/:id`, () => HttpResponse.json(productCreated)),
  http.delete(`${UPSTREAM_BASE_URL}/products/:id`, () => HttpResponse.json(productCreated)),
]
