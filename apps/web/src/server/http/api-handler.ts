import type { NextApiRequest, NextApiResponse } from 'next'

import { ZodError } from 'zod'

import { ApiError, isApiError } from '@kitchen/utils'

const LOWEST_ERROR_STATUS = 400
const HIGHEST_ERROR_STATUS = 599
const UNPROCESSABLE = 422
const BAD_GATEWAY = 502
const INTERNAL = 500
const METHOD_NOT_ALLOWED = 405

export type ApiIssue = {
  path: string
  message: string
}

export type ApiErrorBody = {
  error: {
    status: number
    message: string
    issues?: ApiIssue[]
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

type Handler<T> = (req: NextApiRequest, res: NextApiResponse<T | ApiErrorBody>) => Promise<void>

export function sendError<T>(res: NextApiResponse<T | ApiErrorBody>, error: unknown): void {
  if (error instanceof ZodError) {
    res.status(UNPROCESSABLE).json({
      error: {
        status: UNPROCESSABLE,
        message: 'The submitted product is invalid',
        issues: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    })

    return
  }

  if (isApiError(error)) {
    const status =
      error.status >= LOWEST_ERROR_STATUS && error.status <= HIGHEST_ERROR_STATUS
        ? error.status
        : BAD_GATEWAY

    res.status(status).json({ error: { status, message: error.message } })

    return
  }

  console.error('Unhandled API error', error)

  res.status(INTERNAL).json({ error: { status: INTERNAL, message: 'Unexpected server error' } })
}

export function createApiHandler<T>(handlers: Partial<Record<Method, Handler<T>>>): Handler<T> {
  const allowed = Object.keys(handlers)

  return async (req, res) => {
    const handler = handlers[req.method as Method]

    if (!handler) {
      res.setHeader('Allow', allowed.join(', '))
      sendError(
        res,
        new ApiError(METHOD_NOT_ALLOWED, `Method ${req.method ?? 'unknown'} is not allowed`),
      )

      return
    }

    try {
      await handler(req, res)
    } catch (error) {
      sendError(res, error)
    }
  }
}
