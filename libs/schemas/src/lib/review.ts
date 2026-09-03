import { z } from 'zod'

export const MAX_RATING = 5

export const reviewSchema = z.object({
  rating: z.number().min(0).max(MAX_RATING),
  comment: z.string(),
  date: z.iso.datetime(),
  reviewerName: z.string(),
})

export type Review = z.infer<typeof reviewSchema>
