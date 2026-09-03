import { useState } from 'react'

import type { AppProps } from 'next/app'
import Head from 'next/head'

import { QueryClientProvider } from '@tanstack/react-query'

import nextI18NextConfig from '../../next-i18next.config'
import { createQueryClient } from '../lib/query-client'
import { appWithTranslation } from '../shared/i18n'
import { LocaleAlternates } from '../shared/seo/locale-alternates'
import { ThemeProvider, type Theme } from '../shared/theme/theme-context'
import { ToastProvider } from '../shared/toast/toast-context'
import { AppError } from '../shared/ui/app-error'
import { ErrorBoundary } from '../shared/ui/error-boundary'
import { Toaster } from '../shared/ui/toaster'

import '../styles/globals.css'

type SharedProps = {
  theme?: Theme
  origin?: string
  noindex?: boolean
}

function App({ Component, pageProps }: AppProps<SharedProps>) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialTheme={pageProps.theme}>
        <ToastProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          {pageProps.noindex ? (
            <Head>
              <meta name="robots" content="noindex, nofollow" />
            </Head>
          ) : (
            <LocaleAlternates origin={pageProps.origin} />
          )}
          <ErrorBoundary fallback={<AppError />}>
            <Component {...pageProps} />
          </ErrorBoundary>
          <Toaster />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default appWithTranslation(App, nextI18NextConfig)
