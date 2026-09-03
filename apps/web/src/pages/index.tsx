import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'

import { productListParamsSchema } from '@kitchen/schemas'

import type { ServerRenderedPage } from '../features/products/api/hooks'
import { listHref } from '../features/products/model/list-route'
import { ProductList } from '../features/products/ui/product-list'
import { sharedPageProps, type SharedPageProps } from '../server/page-props'
import { listProducts } from '../server/products/service'
import { useTranslation } from '../shared/i18n'
import { Layout } from '../shared/ui/layout'

type Props = SharedPageProps & {
  server: ServerRenderedPage | null
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
  const params = productListParamsSchema.parse(ctx.query)
  const shared = await sharedPageProps(ctx)

  try {
    const list = await listProducts(params)

    if (list.page !== params.page) {
      return {
        redirect: { destination: listHref({ ...params, page: list.page }), permanent: false },
      }
    }

    return { props: { ...shared, server: { params, list, fetchedAt: Date.now() } } }
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
