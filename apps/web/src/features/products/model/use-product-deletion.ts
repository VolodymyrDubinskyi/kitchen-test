import { useCallback, useState } from 'react'

import type { Product } from '@kitchen/schemas'

import { useDeleteProduct } from '../api/hooks'

export type ProductDeletion = {
  pending: Product | null
  isDeleting: (id: number) => boolean
  request: (id: number) => void
  cancel: () => void
  confirm: () => void
}

export function useProductDeletion(products: Product[] | undefined): ProductDeletion {
  const [pendingId, setPendingId] = useState<number | null>(null)
  const remove = useDeleteProduct()

  const cancel = useCallback(() => setPendingId(null), [])

  const confirm = useCallback(() => {
    if (pendingId === null) {
      return
    }

    remove.mutate(pendingId, { onSettled: cancel })
  }, [pendingId, remove, cancel])

  const isDeleting = useCallback(
    (id: number) => remove.isPending && pendingId === id,
    [remove.isPending, pendingId],
  )

  return {
    pending: products?.find(product => product.id === pendingId) ?? null,
    isDeleting,
    request: setPendingId,
    cancel,
    confirm,
  }
}
