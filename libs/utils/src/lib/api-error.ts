const CLIENT_ERROR_FLOOR = 400
const SERVER_ERROR_FLOOR = 500

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isClientError(error: unknown): boolean {
  return (
    isApiError(error) && error.status >= CLIENT_ERROR_FLOOR && error.status < SERVER_ERROR_FLOOR
  )
}
