import { z } from 'zod'

import { productSchema } from './product'

export const PRODUCTS_PAGE_SIZE = 12

export const productIdSchema = z.coerce.number().int().positive()

export const productListParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  search: z.string().trim().min(1).optional().catch(undefined),
})

export type ProductListParams = z.infer<typeof productListParamsSchema>

export const productListResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageCount: z.number().int().positive(),
})

export type ProductListResponse = z.infer<typeof productListResponseSchema>
