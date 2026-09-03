import type { IncomingMessage } from 'node:http'

export function originOf(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-proto']
  const protocol = typeof forwarded === 'string' ? forwarded.split(',')[0] : 'http'

  return `${protocol}://${req.headers.host ?? 'localhost'}`
}
