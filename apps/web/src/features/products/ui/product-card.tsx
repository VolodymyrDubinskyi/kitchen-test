import Link from 'next/link'
import { useRouter } from 'next/router'

import { MAX_RATING, type Product } from '@kitchen/schemas'
import { formatPrice } from '@kitchen/utils'

import { useTranslation } from '../../../shared/i18n'
import { Button } from '../../../shared/ui/button'
import { LinkButton } from '../../../shared/ui/link-button'
import { RatingStars } from '../../../shared/ui/rating-stars'
import { ProductImage } from './product-image'

export function ProductCard({
  product,
  onDelete,
  deleting,
}: {
  product: Product
  onDelete: (id: number) => void
  deleting: boolean
}) {
  const { t } = useTranslation('common')
  const { locale } = useRouter()

  const requestDelete = () => onDelete(product.id)

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start gap-3">
        <ProductImage
          src={product.thumbnail}
          alt={product.title}
          width={72}
          height={72}
          className="h-18 w-18 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-zinc-800"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${product.id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {product.title}
          </Link>
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>
        </div>
      </div>

      {product.rating > 0 ? (
        <p className="flex items-center gap-2 text-sm">
          <RatingStars
            value={product.rating}
            label={t('products.ratingLabel', {
              value: product.rating.toFixed(1),
              max: MAX_RATING,
            })}
          />
          <span className="text-zinc-500 dark:text-zinc-400">{product.rating.toFixed(1)}</span>
        </p>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('products.unrated')}</p>
      )}

      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">{formatPrice(product.price, locale)}</span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {product.stock > 0
            ? t('products.stockCount', { count: product.stock })
            : t('products.outOfStock')}
        </span>
      </div>

      <div className="flex gap-2">
        <LinkButton
          href={`/products/${product.id}/edit`}
          variant="secondary"
          aria-label={t('products.editNamed', { title: product.title })}
        >
          {t('products.edit')}
        </LinkButton>
        <Button variant="danger" type="button" onClick={requestDelete} disabled={deleting}>
          {t('products.delete')}
        </Button>
      </div>
    </article>
  )
}
