import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { ProductInput } from '@kitchen/schemas'

import { useCreateProduct, useUploadImage } from '../../features/products/api/hooks'
import { ProductForm } from '../../features/products/ui/product-form'
import { sharedPageProps, type SharedPageProps } from '../../server/page-props'
import { useTranslation } from '../../shared/i18n'
import { Layout } from '../../shared/ui/layout'

type Props = SharedPageProps & { noindex: true }

export const getServerSideProps: GetServerSideProps<Props> = async ctx => ({
  props: { ...(await sharedPageProps(ctx)), noindex: true },
})

export default function NewProductPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const create = useCreateProduct()
  const upload = useUploadImage()

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
        uploading={upload.isPending}
        onUploadImage={upload.mutateAsync}
      />
    </Layout>
  )
}
