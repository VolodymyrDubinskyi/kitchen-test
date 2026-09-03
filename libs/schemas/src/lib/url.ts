import { z } from 'zod'

export const HTTP_PROTOCOL = /^https?$/

export const UPLOAD_PATH_PATTERN = /^\/api\/uploads\/[0-9a-f-]{36}$/

export const httpUrlSchema = z.url({ protocol: HTTP_PROTOCOL })

export function isUploadPath(value: string): boolean {
  return UPLOAD_PATH_PATTERN.test(value)
}

export function isImageSource(value: string): boolean {
  return isUploadPath(value) || httpUrlSchema.safeParse(value).success
}

export function imageSourceSchema(message: string) {
  return z.string().refine(isImageSource, { error: message })
}
