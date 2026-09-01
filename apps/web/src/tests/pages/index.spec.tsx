import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HomePage from '../../pages/index'

describe('HomePage', () => {
  it('renders the application heading', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { name: 'Kitchen' })).toBeInTheDocument()
  })
})
