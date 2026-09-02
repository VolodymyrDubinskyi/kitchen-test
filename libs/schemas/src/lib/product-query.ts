import { z } from 'zod'

export const PRODUCTS_PAGE_SIZE = 12

export const productIdSchema = z.coerce.number().int().positive()

export const productListParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  search: z.string().trim().min(1).optional().catch(undefined),
})

export type ProductListParams = z.infer<typeof productListParamsSchema>
