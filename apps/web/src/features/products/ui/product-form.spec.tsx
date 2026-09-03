import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithI18n } from '../../../tests/render'
import { ProductForm } from './product-form'

function setup(overrides: Partial<Parameters<typeof ProductForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  const utils = renderWithI18n(
    <ProductForm
      submitLabel="Create product"
      pending={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...overrides}
    />,
  )

  return { ...utils, onSubmit, onCancel }
}

describe('ProductForm', () => {
  it('renders every field as a labelled control', () => {
    setup()

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Price')).toBeInTheDocument()
    expect(screen.getByLabelText('Stock')).toBeInTheDocument()
    expect(screen.getByLabelText('Thumbnail URL')).toBeInTheDocument()
  })

  it('blocks submission of an empty form and explains every field', async () => {
    const { user, onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: 'Create product' }))

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 2 characters')).toBeInTheDocument()
    })

    expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument()
    expect(screen.getByText('Category is required')).toBeInTheDocument()
    expect(screen.getByText('Price must be a number')).toBeInTheDocument()
    expect(
      screen.getByText('Thumbnail must be an http or https URL, or an uploaded image'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('marks an invalid control for assistive technology', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Create product' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('rejects a thumbnail that is neither an http url nor an uploaded image', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('Thumbnail URL'), 'javascript:alert(1)')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    await waitFor(() => {
      expect(
        screen.getByText('Thumbnail must be an http or https URL, or an uploaded image'),
      ).toBeInTheDocument()
    })
  })

  it('submits parsed values, with numbers as numbers and text trimmed', async () => {
    const { user, onSubmit } = setup()

    await user.type(screen.getByLabelText('Title'), '  Lash Princess  ')
    await user.type(screen.getByLabelText('Description'), 'A mascara that does not clump')
    await user.type(screen.getByLabelText('Category'), '  beauty  ')
    await user.type(screen.getByLabelText('Price'), '9.99')
    await user.type(screen.getByLabelText('Stock'), '12')
    await user.type(screen.getByLabelText('Thumbnail URL'), 'https://cdn.dummyjson.com/x.webp')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Lash Princess',
        category: 'beauty',
        price: 9.99,
        stock: 12,
      }),
      expect.anything(),
    )
  })

  it('pre-fills the form when editing an existing product', () => {
    setup({ defaultValues: { title: 'Existing product', price: 42 } })

    expect(screen.getByLabelText('Title')).toHaveValue('Existing product')
    expect(screen.getByLabelText('Price')).toHaveValue('42')
  })

  it('accepts a comma as the decimal separator, as a Russian keyboard produces', async () => {
    const { user, onSubmit } = setup()

    await user.type(screen.getByLabelText('Title'), 'Lash Princess')
    await user.type(screen.getByLabelText('Description'), 'A mascara that does not clump')
    await user.type(screen.getByLabelText('Category'), 'beauty')
    await user.type(screen.getByLabelText('Price'), '19,99')
    await user.type(screen.getByLabelText('Stock'), '3')
    await user.type(screen.getByLabelText('Thumbnail URL'), 'https://cdn.dummyjson.com/x.webp')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ price: 19.99 }),
      expect.anything(),
    )
  })

  it('keeps unparseable input visible instead of silently clearing it', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('Price'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    await waitFor(() => {
      expect(screen.getByText('Price must be a number')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Price')).toHaveValue('abc')
  })

  it('treats a trailing separator as the number typed so far', async () => {
    const { user, onSubmit } = setup()

    await user.type(screen.getByLabelText('Title'), 'Lash Princess')
    await user.type(screen.getByLabelText('Description'), 'A mascara that does not clump')
    await user.type(screen.getByLabelText('Category'), 'beauty')
    await user.type(screen.getByLabelText('Price'), '12.')
    await user.type(screen.getByLabelText('Stock'), '1')
    await user.type(screen.getByLabelText('Thumbnail URL'), 'https://cdn.dummyjson.com/x.webp')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ price: 12 }), expect.anything())
  })

  it('puts the uploaded image into the thumbnail field', async () => {
    const onUploadImage = vi
      .fn()
      .mockResolvedValue('/api/uploads/2f1c7d9e-4a3b-4c5d-8e6f-0a1b2c3d4e5f')
    const { user } = setup({ onUploadImage })

    const file = new File(['fake-bytes'], 'photo.png', { type: 'image/png' })

    await user.upload(screen.getByLabelText('Upload an image'), file)

    await waitFor(() => {
      expect(screen.getByLabelText('Thumbnail URL')).toHaveValue(
        '/api/uploads/2f1c7d9e-4a3b-4c5d-8e6f-0a1b2c3d4e5f',
      )
    })

    expect(onUploadImage).toHaveBeenCalledWith(file)
  })

  it('leaves the field untouched when the upload fails', async () => {
    const onUploadImage = vi.fn().mockRejectedValue(new Error('nope'))
    const { user } = setup({ onUploadImage })

    await user.upload(
      screen.getByLabelText('Upload an image'),
      new File(['x'], 'photo.png', { type: 'image/png' }),
    )

    await waitFor(() => expect(onUploadImage).toHaveBeenCalledOnce())

    expect(screen.getByLabelText('Thumbnail URL')).toHaveValue('')
  })

  it('disables the picker when no upload handler is wired', () => {
    setup()

    expect(screen.getByLabelText('Upload an image')).toBeDisabled()
  })

  it('disables both actions while a submission is in flight', () => {
    setup({ pending: true })

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })
})
