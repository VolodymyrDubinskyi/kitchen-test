import type { ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { isImageSource, productInputSchema, type ProductInput } from '@kitchen/schemas'

import { useTranslation } from '../../../shared/i18n'
import { Button } from '../../../shared/ui/button'
import { NumberField, TextAreaField, TextField } from '../../../shared/ui/field'
import { ProductImage } from './product-image'

const EMPTY_VALUES = {
  title: '',
  description: '',
  category: '',
  price: undefined,
  stock: undefined,
  brand: '',
  thumbnail: '',
}

type ProductFormProps = {
  defaultValues?: Partial<ProductInput>
  submitLabel: string
  pending: boolean
  uploading?: boolean
  onSubmit: (input: ProductInput) => void
  onCancel: () => void
  onUploadImage?: (file: File) => Promise<string>
}

export function ProductForm({
  defaultValues,
  submitLabel,
  pending,
  uploading = false,
  onSubmit,
  onCancel,
  onUploadImage,
}: ProductFormProps) {
  const { t } = useTranslation('common')

  const { control, handleSubmit, setValue, trigger, watch } = useForm<ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
    mode: 'onBlur',
  })

  const thumbnail = watch('thumbnail')
  const preview = thumbnail && isImageSource(thumbnail) ? thumbnail : null

  const pickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file || !onUploadImage) {
      return
    }

    try {
      setValue('thumbnail', await onUploadImage(file), { shouldDirty: true })
      await trigger('thumbnail')
    } catch {
      return
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextField label={t('form.title')} error={fieldState.error?.message} {...field} />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextAreaField
            label={t('form.description')}
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <TextField label={t('form.category')} error={fieldState.error?.message} {...field} />
          )}
        />

        <Controller
          control={control}
          name="brand"
          render={({ field, fieldState }) => (
            <TextField
              label={t('form.brandOptional')}
              error={fieldState.error?.message}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />

        <Controller
          control={control}
          name="price"
          render={({ field, fieldState }) => (
            <NumberField
              label={t('form.price')}
              error={fieldState.error?.message}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="stock"
          render={({ field, fieldState }) => (
            <NumberField
              label={t('form.stock')}
              error={fieldState.error?.message}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="thumbnail"
        render={({ field, fieldState }) => (
          <TextField
            label={t('form.thumbnail')}
            inputMode="url"
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />

      <div className="flex items-center gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {uploading ? t('form.uploading') : t('form.uploadImage')}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            disabled={uploading || !onUploadImage}
            onChange={event => void pickImage(event)}
            className="text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-900"
          />
        </label>

        {preview ? (
          <ProductImage
            src={preview}
            alt={t('form.thumbnailPreview')}
            width={64}
            height={64}
            className="h-16 w-16 rounded-md object-cover"
          />
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? t('form.submitting') : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
          {t('form.cancel')}
        </Button>
      </div>
    </form>
  )
}
