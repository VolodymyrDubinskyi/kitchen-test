import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  Product,
  ProductInput,
  ProductListParams,
  ProductListResponse,
} from '@kitchen/schemas'
import { isApiError } from '@kitchen/utils'

import { useTranslation } from '../../../shared/i18n'
import { useToast } from '../../../shared/toast/toast-context'
import * as api from './client'
import { productKeys } from './query-keys'

export type ServerRenderedPage = {
  params: ProductListParams
  list: ProductListResponse
  fetchedAt: number
}

function seedFor(params: ProductListParams, server: ServerRenderedPage | undefined) {
  if (!server || server.params.page !== params.page || server.params.search !== params.search) {
    return {}
  }

  return { initialData: server.list, initialDataUpdatedAt: server.fetchedAt }
}

export function useProductPage(params: ProductListParams, server?: ServerRenderedPage) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => api.fetchProductPage(params, signal),
    placeholderData: keepPreviousData,
    ...seedFor(params, server),
  })
}

export function useProduct(id: number, initialData?: Product) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => api.fetchProduct(id, signal),
    initialData,
  })
}

function useMutationFeedback() {
  const { t } = useTranslation('common')
  const toast = useToast()

  return {
    t,
    toast,
    onError: (error: unknown) =>
      toast.showError(isApiError(error) ? error.message : t('errors.generic')),
  }
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { t, onError, toast } = useMutationFeedback()

  return useMutation({
    mutationFn: (input: ProductInput) => api.createProduct(input),
    onSuccess: () => {
      toast.showSuccess(t('toast.created'))
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
    onError,
  })
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient()
  const { t, onError, toast } = useMutationFeedback()

  return useMutation({
    mutationFn: (input: ProductInput) => api.updateProduct(id, input),
    onSuccess: product => {
      queryClient.setQueryData(productKeys.detail(id), product)
      toast.showSuccess(t('toast.updated'))
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
    onError,
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const { t, onError, toast } = useMutationFeedback()

  return useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onSuccess: (_response, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) })
      toast.showSuccess(t('toast.deleted'))
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
    onError,
  })
}

export function useUploadImage() {
  const { onError } = useMutationFeedback()

  return useMutation({
    mutationFn: (file: File) => api.uploadImage(file),
    onError,
  })
}
