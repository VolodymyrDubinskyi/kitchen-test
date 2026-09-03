import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

import { productListResponseSchema } from '@kitchen/schemas'

import { fetchFromApi } from '../server/api'
import { originOf } from '../server/origin'

const LOCALES = ['en', 'uk'] as const
const DEFAULT_LOCALE = 'en'
const MAX_PAGES = 100

function escapeXml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    character =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character] ??
      character,
  )
}

function urlFor(origin: string, locale: string, path: string): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`

  return escapeXml(`${origin}${prefix}${path === '/' ? '' : path}` || origin)
}

function entriesFor(origin: string, path: string): string {
  const alternates = LOCALES.map(
    locale =>
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${urlFor(origin, locale, path)}"/>`,
  ).join('\n')

  return LOCALES.map(locale =>
    ['  <url>', `    <loc>${urlFor(origin, locale, path)}</loc>`, alternates, '  </url>'].join(
      '\n',
    ),
  ).join('\n')
}

async function productPaths(ctx: GetServerSidePropsContext): Promise<string[]> {
  const first = await fetchFromApi(ctx, '/products?page=1', productListResponseSchema)
  const pageCount = Math.min(first.pageCount, MAX_PAGES)

  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_item, index) =>
      fetchFromApi(ctx, `/products?page=${index + 2}`, productListResponseSchema),
    ),
  )

  return [first, ...rest].flatMap(page => page.products.map(product => `/products/${product.id}`))
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const origin = originOf(ctx.req)

  let paths = ['/']

  try {
    paths = ['/', ...(await productPaths(ctx))]
  } catch (error) {
    console.error('Sitemap could not list products', error)
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...paths.map(path => entriesFor(origin, path)),
    '</urlset>',
  ].join('\n')

  ctx.res.setHeader('content-type', 'application/xml; charset=utf-8')
  ctx.res.setHeader('cache-control', 'public, max-age=0, s-maxage=3600')
  ctx.res.write(body)
  ctx.res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}
