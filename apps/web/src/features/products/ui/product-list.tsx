import { useState, type ChangeEvent } from 'react'

import { PRODUCTS_PAGE_SIZE } from '@kitchen/schemas'

import { useTranslation } from '../../../shared/i18n'
import { Button } from '../../../shared/ui/button'
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog'
import { TextField } from '../../../shared/ui/field'
import { useDeleteProduct, useProductPage, type ServerRenderedPage } from '../api/hooks'
import { useProductListParams } from '../model/use-product-list-params'
import { ProductCard } from './product-card'

export function ProductList({
  server,
  loadFailed,
}: {
  server?: ServerRenderedPage
  loadFailed: boolean
}) {
  const { t } = useTranslation('common')
  const { params, searchInput, setSearchInput, goToPage } = useProductListParams()
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const { data: page, isError, isFetching, refetch } = useProductPage(params, server)
  const remove = useDeleteProduct()

  const failed = isError || (loadFailed && !page)

  const retry = () => void refetch()
  const changeSearch = (event: ChangeEvent<HTMLInputElement>) => setSearchInput(event.target.value)
  const goToPreviousPage = () => goToPage(params.page - 1)
  const goToNextPage = () => goToPage(params.page + 1)
  const closeDeleteDialog = () => setPendingDeleteId(null)

  const confirmDelete = () => {
    if (pendingDeleteId === null) {
      return
    }

    remove.mutate(pendingDeleteId, { onSettled: closeDeleteDialog })
  }

  const pageCount = page ? Math.max(1, Math.ceil(page.total / PRODUCTS_PAGE_SIZE)) : 1
  const pendingDelete = page?.products.find(product => product.id === pendingDeleteId) ?? null
  const isEmpty = Boolean(page) && page?.products.length === 0
  const emptyMessage = params.search ? t('products.empty') : t('products.emptyPage')

  return (
    <div className="flex flex-col gap-6">
      <TextField
        label={t('products.searchLabel')}
        placeholder={t('products.searchPlaceholder')}
        type="search"
        value={searchInput}
        onChange={changeSearch}
      />

      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        {t('notice.readOnlyApi')}
      </p>

      {failed ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-red-300 p-4 dark:border-red-900">
          <p className="text-sm text-red-600 dark:text-red-400">{t('errors.loadProducts')}</p>
          <Button type="button" onClick={retry}>
            {t('errors.retry')}
          </Button>
        </div>
      ) : null}

      <p aria-live="polite" className="min-h-5 text-sm text-zinc-500">
        {isFetching ? t('products.loading') : null}
        {!isFetching && isEmpty ? emptyMessage : null}
      </p>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${isFetching ? 'opacity-60 transition-opacity' : ''}`}
      >
        {page?.products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            deleting={remove.isPending && pendingDeleteId === product.id}
            onDelete={setPendingDeleteId}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <Button
          type="button"
          variant="secondary"
          disabled={params.page <= 1}
          onClick={goToPreviousPage}
        >
          {t('pagination.previous')}
        </Button>
        <span className="text-zinc-500">
          {t('pagination.status', { page: params.page, pageCount })}
        </span>
        <Button
          type="button"
          variant="secondary"
          disabled={params.page >= pageCount}
          onClick={goToNextPage}
        >
          {t('pagination.next')}
        </Button>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t('confirm.deleteTitle')}
        body={t('confirm.deleteBody', { title: pendingDelete?.title ?? '' })}
        confirmLabel={t('confirm.confirm')}
        cancelLabel={t('confirm.cancel')}
        pending={remove.isPending}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
