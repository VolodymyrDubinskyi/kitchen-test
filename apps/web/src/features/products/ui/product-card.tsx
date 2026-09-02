import Link from 'next/link'
import { useRouter } from 'next/router'

import type { Product } from '@kitchen/schemas'
import { formatPrice } from '@kitchen/utils'

import { useTranslation } from '../../../shared/i18n'
import { Button } from '../../../shared/ui/button'
import { LinkButton } from '../../../shared/ui/link-button'
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
          className="h-18 w-18 rounded-md object-cover"
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

      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">{formatPrice(product.price, locale)}</span>
        <span className="text-zinc-500">
          {product.stock > 0
            ? t('products.stockCount', { count: product.stock })
            : t('products.outOfStock')}
        </span>
      </div>

      <div className="flex gap-2">
        <LinkButton href={`/products/${product.id}/edit`} variant="secondary">
          {t('products.edit')}
        </LinkButton>
        <Button variant="danger" type="button" onClick={requestDelete} disabled={deleting}>
          {t('products.delete')}
        </Button>
      </div>
    </article>
  )
}
