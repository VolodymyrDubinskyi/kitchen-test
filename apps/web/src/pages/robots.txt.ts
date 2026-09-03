import type { GetServerSideProps } from 'next'

import { originOf } from '../server/origin'

function robots(origin: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
  ].join('\n')
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  ctx.res.setHeader('content-type', 'text/plain; charset=utf-8')
  ctx.res.setHeader('cache-control', 'public, max-age=0, s-maxage=86400')
  ctx.res.write(robots(originOf(ctx.req)))
  ctx.res.end()

  return { props: {} }
}

export default function RobotsTxt() {
  return null
}
