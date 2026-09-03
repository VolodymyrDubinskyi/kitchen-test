import { z } from 'zod'

import { decimalField } from './decimal'
import type { Product } from './product'
import { imageSourceSchema } from './url'

export const TITLE_MAX_LENGTH = 120
export const DESCRIPTION_MIN_LENGTH = 10
export const DESCRIPTION_MAX_LENGTH = 2000
export const BRAND_MAX_LENGTH = 80

const priceSchema = z
  .number({ error: 'Price must be a number' })
  .positive('Price must be greater than 0')

const stockSchema = z
  .number({ error: 'Stock must be a number' })
  .int('Stock must be a whole number')
  .nonnegative('Stock cannot be negative')

export const productInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`),
  description: z
    .string()
    .trim()
    .min(
      DESCRIPTION_MIN_LENGTH,
      `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`,
    )
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
    ),
  category: z.string().trim().min(1, 'Category is required'),
  price: priceSchema,
  stock: stockSchema,
  brand: z
    .string()
    .trim()
    .max(BRAND_MAX_LENGTH, `Brand must be at most ${BRAND_MAX_LENGTH} characters`)
    .optional(),
  thumbnail: imageSourceSchema('Thumbnail must be an http or https URL, or an uploaded image'),
})

export type ProductInput = z.infer<typeof productInputSchema>

export const productFormSchema = productInputSchema.extend({
  price: decimalField(priceSchema),
  stock: decimalField(stockSchema),
})

export type ProductFormValues = z.input<typeof productFormSchema>

export function toProductFormValues(product?: Partial<Product>): ProductFormValues {
  return {
    title: product?.title ?? '',
    description: product?.description ?? '',
    category: product?.category ?? '',
    price: product?.price === undefined ? '' : String(product.price),
    stock: product?.stock === undefined ? '' : String(product.stock),
    brand: product?.brand ?? '',
    thumbnail: product?.thumbnail ?? '',
  }
}
