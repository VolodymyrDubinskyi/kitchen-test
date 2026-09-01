import type { ZodType } from 'zod'

import { ApiError } from '@kitchen/utils'

const DEFAULT_BASE_URL = 'https://dummyjson.com'
const TIMEOUT_MS = 10_000

export function upstreamBaseUrl(): string {
  return process.env.DUMMYJSON_BASE_URL ?? DEFAULT_BASE_URL
}

function withTimeout(callerSignal: AbortSignal | null | undefined): AbortSignal {
  const timeout = AbortSignal.timeout(TIMEOUT_MS)

  if (!callerSignal) {
    return timeout
  }

  return AbortSignal.any([callerSignal, timeout])
}

async function upstreamMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json()

    if (body !== null && typeof body === 'object' && 'message' in body) {
      const { message } = body

      if (typeof message === 'string' && message.length > 0) {
        return message
      }
    }
  } catch {
    return fallback
  }

  return fallback
}

export async function requestUpstream<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${upstreamBaseUrl()}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers },
      signal: withTimeout(init?.signal),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new ApiError(504, 'The product service took too long to respond')
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(502, 'The product service is unreachable')
  }

  if (!response.ok) {
    const fallback = `The product service responded with ${response.status}`

    throw new ApiError(response.status, await upstreamMessage(response, fallback))
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new ApiError(502, 'The product service returned a malformed response')
  }

  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    console.error('Upstream payload did not match the schema', {
      path,
      issues: parsed.error.issues,
    })

    throw new ApiError(502, 'The product service returned an unexpected payload')
  }

  return parsed.data
}
