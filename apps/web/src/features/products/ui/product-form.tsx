import { Controller, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { productInputSchema, type ProductInput } from '@kitchen/schemas'

import { useTranslation } from '../../../shared/i18n'
import { Button } from '../../../shared/ui/button'
import { NumberField, TextAreaField, TextField } from '../../../shared/ui/field'

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
  onSubmit: (input: ProductInput) => void
  onCancel: () => void
}

export function ProductForm({
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { t } = useTranslation('common')

  const { control, handleSubmit } = useForm<ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
    mode: 'onBlur',
  })

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
