import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Product } from '@kitchen/schemas'
import { product as capturedProduct } from '@kitchen/testing'

import { renderWithI18n } from '../../../tests/render'
import { ProductGallery } from './product-gallery'

const base = capturedProduct as Product

function withImages(images: string[]): Product {
  return { ...base, images }
}

describe('ProductGallery', () => {
  it('shows the first image to begin with', () => {
    renderWithI18n(
      <ProductGallery
        product={withImages([
          'https://cdn.dummyjson.com/1.webp',
          'https://cdn.dummyjson.com/2.webp',
        ])}
      />,
    )

    expect(screen.getByAltText(base.title)).toHaveAttribute(
      'src',
      expect.stringContaining('1.webp'),
    )
  })

  it('offers no picker when there is only one image', () => {
    renderWithI18n(<ProductGallery product={withImages(['https://cdn.dummyjson.com/1.webp'])} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('switches the main image when another one is chosen', async () => {
    const { user } = renderWithI18n(
      <ProductGallery
        product={withImages([
          'https://cdn.dummyjson.com/1.webp',
          'https://cdn.dummyjson.com/2.webp',
        ])}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Image 2 of 2' }))

    expect(screen.getByAltText(base.title)).toHaveAttribute(
      'src',
      expect.stringContaining('2.webp'),
    )
  })

  it('marks the chosen image for assistive technology', async () => {
    const { user } = renderWithI18n(
      <ProductGallery
        product={withImages([
          'https://cdn.dummyjson.com/1.webp',
          'https://cdn.dummyjson.com/2.webp',
        ])}
      />,
    )

    expect(screen.getByRole('button', { name: 'Image 1 of 2' })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Image 2 of 2' }))

    expect(screen.getByRole('button', { name: 'Image 2 of 2' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('falls back to the thumbnail for a product with no gallery, as locally created ones have', () => {
    renderWithI18n(<ProductGallery product={withImages([])} />)

    expect(screen.getByAltText(base.title)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
