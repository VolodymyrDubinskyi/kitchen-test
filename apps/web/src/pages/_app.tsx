import { useState } from 'react'

import type { AppProps } from 'next/app'
import Head from 'next/head'

import { QueryClientProvider } from '@tanstack/react-query'

import { createQueryClient } from '../lib/query-client'

import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Kitchen — Products</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
