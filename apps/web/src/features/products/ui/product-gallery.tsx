import { useState } from 'react'

import type { Product } from '@kitchen/schemas'

import { useTranslation } from '../../../shared/i18n'
import { ProductImage } from './product-image'

const MAIN_SIZE = 280
const THUMB_SIZE = 64

export function ProductGallery({ product }: { product: Product }) {
  const { t } = useTranslation('common')
  const sources = product.images.length > 0 ? product.images : [product.thumbnail]
  const [selected, setSelected] = useState(0)
  const current = sources[selected] ?? sources[0]

  return (
    <div className="flex w-full max-w-xs shrink-0 flex-col gap-3">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <ProductImage
          src={current}
          alt={product.title}
          width={MAIN_SIZE}
          height={MAIN_SIZE}
          priority
          sizes="(max-width: 640px) 100vw, 320px"
          className="h-full w-full object-cover"
        />
      </div>

      {sources.length > 1 ? (
        <ul className="flex flex-wrap gap-2">
          {sources.map((source, index) => (
            <li key={source}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-current={index === selected}
                aria-label={t('products.imageOf', { index: index + 1, total: sources.length })}
                className={`rounded-md border-2 p-0.5 transition-colors ${
                  index === selected
                    ? 'border-zinc-900 dark:border-zinc-100'
                    : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <ProductImage
                  src={source}
                  alt=""
                  width={THUMB_SIZE}
                  height={THUMB_SIZE}
                  className="h-16 w-16 rounded bg-zinc-100 object-cover dark:bg-zinc-800"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
