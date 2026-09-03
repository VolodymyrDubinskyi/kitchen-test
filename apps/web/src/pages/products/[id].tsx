import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { MAX_RATING, productIdSchema, productSchema, type Product } from '@kitchen/schemas'
import { formatDate, formatPrice, isApiError } from '@kitchen/utils'

import { useProduct } from '../../features/products/api/hooks'
import { ProductGallery } from '../../features/products/ui/product-gallery'
import { fetchFromApi } from '../../server/api'
import { sharedPageProps, type SharedPageProps } from '../../server/page-props'
import { useTranslation } from '../../shared/i18n'
import { Layout } from '../../shared/ui/layout'
import { LinkButton } from '../../shared/ui/link-button'
import { RatingStars } from '../../shared/ui/rating-stars'

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
      props: {
        ...shared,
        id: parsedId.data,
        initialProduct: await fetchFromApi(ctx, `/products/${parsedId.data}`, productSchema),
      },
    }
  } catch (error) {
    if (isApiError(error) && error.status === NOT_FOUND) {
      return { notFound: true }
    }

    console.error('Server-side product fetch failed', error)

    return { props: { ...shared, id: parsedId.data, initialProduct: null } }
  }
}

export default function ProductDetailPage({
  id,
  initialProduct,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation('common')
  const { locale } = useRouter()
  const { data: product } = useProduct(id, initialProduct ?? undefined)

  return (
    <Layout>
      <Head>
        <title>{`${product?.title ?? t('products.detailTitle')} — ${t('app.title')}`}</title>
      </Head>

      <Link href="/" className="text-sm underline underline-offset-4">
        {t('products.back')}
      </Link>

      {!product ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">{t('errors.loadProduct')}</p>
      ) : (
        <article className="mt-6 flex flex-col gap-6 sm:flex-row">
          <ProductGallery key={product.id} product={product} />
          <div className="flex flex-1 flex-col gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{product.title}</h1>
            <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-zinc-500 dark:text-zinc-400">{t('products.category')}</dt>
              <dd>{product.category}</dd>
              <dt className="text-zinc-500 dark:text-zinc-400">{t('products.brand')}</dt>
              <dd>{product.brand ?? '—'}</dd>
              <dt className="text-zinc-500 dark:text-zinc-400">{t('products.rating')}</dt>
              <dd className="flex items-center gap-2">
                {product.rating > 0 ? (
                  <>
                    <RatingStars
                      value={product.rating}
                      label={t('products.ratingLabel', {
                        value: product.rating.toFixed(1),
                        max: MAX_RATING,
                      })}
                    />
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {product.rating.toFixed(1)}
                    </span>
                  </>
                ) : (
                  t('products.unrated')
                )}
              </dd>
              <dt className="text-zinc-500 dark:text-zinc-400">{t('products.stock')}</dt>
              <dd>{product.stock}</dd>
            </dl>
            <p className="text-xl font-semibold">{formatPrice(product.price, locale)}</p>
            <LinkButton href={`/products/${product.id}/edit`}>{t('products.edit')}</LinkButton>
          </div>
        </article>
      )}

      {product ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            {t('products.reviews')}{' '}
            <span className="font-normal text-zinc-500 dark:text-zinc-400">
              ({t('products.reviewCount', { count: product.reviews.length })})
            </span>
          </h2>

          {product.reviews.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              {t('products.noReviews')}
            </p>
          ) : null}
          <ul className="mt-4 flex flex-col gap-4">
            {product.reviews.map(review => (
              <li
                key={`${review.reviewerName}-${review.date}`}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <RatingStars
                    value={review.rating}
                    label={t('products.ratingLabel', { value: review.rating, max: MAX_RATING })}
                  />
                  <span className="font-medium">{review.reviewerName}</span>
                  <time dateTime={review.date} className="text-zinc-500 dark:text-zinc-400">
                    {formatDate(review.date, locale)}
                  </time>
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{review.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Layout>
  )
}
