import { z } from 'zod'

export const HTTP_PROTOCOL = /^https?$/

export const httpUrlSchema = z.url({ protocol: HTTP_PROTOCOL })
