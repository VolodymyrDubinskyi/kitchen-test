import { z } from 'zod'

import { reviewSchema } from './review'
import { httpUrlSchema, imageSourceSchema } from './url'

export const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  category: z.string(),
  price: z.number().nonnegative(),
  rating: z.number().min(0).max(5),
  stock: z.number().int().nonnegative(),
  brand: z.string().optional(),
  thumbnail: imageSourceSchema('Thumbnail must be an http or https URL, or an uploaded image'),
  images: z.array(httpUrlSchema).default([]),
  reviews: z.array(reviewSchema).default([]),
})

export const productPageSchema = z.object({
  products: z.array(productSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
})

export const productWriteResponseSchema = productSchema
  .partial()
  .required({ id: true })
  .extend({
    images: z.array(httpUrlSchema).optional(),
    isDeleted: z.boolean().optional(),
    deletedOn: z.string().optional(),
  })

export type Product = z.infer<typeof productSchema>
export type ProductPage = z.infer<typeof productPageSchema>
export type ProductWriteResponse = z.infer<typeof productWriteResponseSchema>
