import { QueryClient } from '@tanstack/react-query'

import { isClientError } from '@kitchen/utils'

const STALE_TIME_MS = 60_000
const MAX_RETRIES = 2

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isClientError(error)) {
            return false
          }

          return failureCount < MAX_RETRIES
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}
