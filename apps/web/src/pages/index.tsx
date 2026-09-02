import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'

import { productListParamsSchema, PRODUCTS_PAGE_SIZE } from '@kitchen/schemas'

import type { ServerRenderedPage } from '../features/products/api/hooks'
import { ProductList } from '../features/products/ui/product-list'
import { fetchProductPage } from '../server/dummyjson/products'
import { sharedPageProps, type SharedPageProps } from '../server/page-props'
import { useTranslation } from '../shared/i18n'
import { Layout } from '../shared/ui/layout'

type Props = SharedPageProps & {
  server: ServerRenderedPage | null
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
  const params = productListParamsSchema.parse(ctx.query)
  const shared = await sharedPageProps(ctx)

  try {
    const page = await fetchProductPage(params)
    const pageCount = Math.max(1, Math.ceil(page.total / PRODUCTS_PAGE_SIZE))

    if (params.page > pageCount) {
      const query = new URLSearchParams({ page: String(pageCount) })

      if (params.search) {
        query.set('search', params.search)
      }

      return { redirect: { destination: `/?${query.toString()}`, permanent: false } }
    }

    return { props: { ...shared, server: { params, page, fetchedAt: Date.now() } } }
  } catch (error) {
    console.error('Server-side product list failed', error)

    return { props: { ...shared, server: null } }
  }
}

export default function ProductsPage({
  server,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation('common')

  return (
    <Layout>
      <Head>
        <title>{`${t('app.title')} — ${t('nav.products')}`}</title>
      </Head>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{t('nav.products')}</h1>
      <ProductList server={server ?? undefined} loadFailed={server === null} />
    </Layout>
  )
}
