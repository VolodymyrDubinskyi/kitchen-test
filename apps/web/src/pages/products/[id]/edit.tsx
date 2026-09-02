import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { productIdSchema, type Product, type ProductInput } from '@kitchen/schemas'
import { isApiError } from '@kitchen/utils'

import { useProduct, useUpdateProduct } from '../../../features/products/api/hooks'
import { ProductForm } from '../../../features/products/ui/product-form'
import { fetchProduct } from '../../../server/dummyjson/products'
import { sharedPageProps, type SharedPageProps } from '../../../server/page-props'
import { useTranslation } from '../../../shared/i18n'
import { Layout } from '../../../shared/ui/layout'

const NOT_FOUND = 404

type Props = SharedPageProps & {
  id: number
  initialProduct: Product | null
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
  const parsedId = productIdSchema.safeParse(ctx.params?.id)

  if (!parsedId.success) {
    return { notFound: true }
  }

  const shared = await sharedPageProps(ctx)

  try {
    return {
      props: { ...shared, id: parsedId.data, initialProduct: await fetchProduct(parsedId.data) },
    }
  } catch (error) {
    if (isApiError(error) && error.status === NOT_FOUND) {
      return { notFound: true }
    }

    console.error('Server-side product fetch failed', error)

    return { props: { ...shared, id: parsedId.data, initialProduct: null } }
  }
}

function toInput(product: Product): Partial<ProductInput> {
  return {
    title: product.title,
    description: product.description,
    category: product.category,
    price: product.price,
    stock: product.stock,
    brand: product.brand,
    thumbnail: product.thumbnail,
  }
}

export default function EditProductPage({
  id,
  initialProduct,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { data: product } = useProduct(id, initialProduct ?? undefined)
  const update = useUpdateProduct(id)

  const goToProduct = () => void router.push(`/products/${id}`)
  const submit = (input: ProductInput) => update.mutate(input, { onSuccess: goToProduct })

  return (
    <Layout>
      <Head>
        <title>{`${t('form.editTitle')} — ${t('app.title')}`}</title>
      </Head>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{t('form.editTitle')}</h1>

      {!product ? (
        <p className="text-sm text-red-600 dark:text-red-400">{t('errors.loadProduct')}</p>
      ) : (
        <ProductForm
          defaultValues={toInput(product)}
          submitLabel={t('form.submitUpdate')}
          pending={update.isPending}
          onCancel={goToProduct}
          onSubmit={submit}
        />
      )}
    </Layout>
  )
}
