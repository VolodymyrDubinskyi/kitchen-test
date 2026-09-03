import { z } from 'zod'

import { decimalField } from './decimal'
import type { Product } from './product'
import { imageSourceSchema } from './url'

export const TITLE_MAX_LENGTH = 120
export const DESCRIPTION_MIN_LENGTH = 10
export const DESCRIPTION_MAX_LENGTH = 2000
export const BRAND_MAX_LENGTH = 80

// Every message above is an i18n key; these are the values its placeholders take, so
// the limits stay defined here rather than being retyped in each locale file.
export const VALIDATION_LIMITS = {
  titleMax: TITLE_MAX_LENGTH,
  descriptionMin: DESCRIPTION_MIN_LENGTH,
  descriptionMax: DESCRIPTION_MAX_LENGTH,
  brandMax: BRAND_MAX_LENGTH,
} as const

const priceSchema = z
  .number({ error: 'validation.priceNumber' })
  .positive('validation.pricePositive')

const stockSchema = z
  .number({ error: 'validation.stockNumber' })
  .int('validation.stockInteger')
  .nonnegative('validation.stockNonNegative')

export const productInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'validation.titleMin')
    .max(TITLE_MAX_LENGTH, 'validation.titleMax'),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN_LENGTH, 'validation.descriptionMin')
    .max(DESCRIPTION_MAX_LENGTH, 'validation.descriptionMax'),
  category: z.string().trim().min(1, 'validation.categoryRequired'),
  price: priceSchema,
  stock: stockSchema,
  brand: z.string().trim().max(BRAND_MAX_LENGTH, 'validation.brandMax').optional(),
  thumbnail: imageSourceSchema('validation.thumbnailInvalid'),
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
