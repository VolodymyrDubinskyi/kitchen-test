import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { ProductInput } from '@kitchen/schemas'

import { useCreateProduct } from '../../features/products/api/hooks'
import { ProductForm } from '../../features/products/ui/product-form'
import { sharedPageProps, type SharedPageProps } from '../../server/page-props'
import { useTranslation } from '../../shared/i18n'
import { Layout } from '../../shared/ui/layout'

export const getServerSideProps: GetServerSideProps<SharedPageProps> = async ctx => ({
  props: await sharedPageProps(ctx),
})

export default function NewProductPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const create = useCreateProduct()

  const goToList = () => void router.push('/')
  const submit = (input: ProductInput) => create.mutate(input, { onSuccess: goToList })

  return (
    <Layout>
      <Head>
        <title>{`${t('form.createTitle')} — ${t('app.title')}`}</title>
      </Head>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{t('form.createTitle')}</h1>
      <ProductForm
        submitLabel={t('form.submitCreate')}
        pending={create.isPending}
        onCancel={goToList}
        onSubmit={submit}
      />
    </Layout>
  )
}
