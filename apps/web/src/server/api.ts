import type { GetServerSidePropsContext } from 'next'

import type { ZodType } from 'zod'

import { ApiError } from '@kitchen/utils'

import { originOf } from './origin'

const UNREACHABLE = 502
const TIMEOUT_MS = 10_000

type ErrorEnvelope = {
  error?: { message?: string }
}

async function messageOf(response: Response, fallback: string): Promise<string> {
  try {
    const body: ErrorEnvelope = await response.json()

    return body.error?.message ?? fallback
  } catch {
    return fallback
  }
}

export async function fetchFromApi<T>(
  ctx: GetServerSidePropsContext,
  path: string,
  schema: ZodType<T>,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${originOf(ctx.req)}/api${path}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    throw new ApiError(UNREACHABLE, 'The product service is unreachable')
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      await messageOf(response, `The product service responded with ${response.status}`),
    )
  }

  const parsed = schema.safeParse(await response.json().catch(() => null))

  if (!parsed.success) {
    throw new ApiError(UNREACHABLE, 'The product service returned an unexpected payload')
  }

  return parsed.data
}
