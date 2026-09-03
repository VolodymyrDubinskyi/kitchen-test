import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RatingStars } from './rating-stars'

function fillWidth(): string {
  const fill = screen.getByTestId('rating-stars-fill')

  return fill.style.width
}

describe('RatingStars', () => {
  it.each([
    ['a whole rating', 4, '80%'],
    ['a fractional rating', 2.6, '52%'],
    ['the bottom of the scale', 0, '0%'],
    ['the top of the scale', 5, '100%'],
  ])('fills the stars proportionally for %s', (_label, value, expected) => {
    render(<RatingStars value={value} label="Rated" />)

    expect(fillWidth()).toBe(expected)
  })

  it.each([
    ['below the scale', -1, '0%'],
    ['above the scale', 9, '100%'],
  ])('clamps a value %s', (_label, value, expected) => {
    render(<RatingStars value={value} label="Rated" />)

    expect(fillWidth()).toBe(expected)
  })

  it('exposes one labelled image and hides the glyphs from assistive technology', () => {
    render(<RatingStars value={3} label="Rated 3.0 out of 5" />)

    expect(screen.getByRole('img', { name: 'Rated 3.0 out of 5' })).toBeInTheDocument()
    expect(screen.queryByText('★★★★★', { ignore: '[aria-hidden="true"]' })).not.toBeInTheDocument()
  })
})
