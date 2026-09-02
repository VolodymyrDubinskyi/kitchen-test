import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './confirm-dialog'

function setup(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()

  const utils = render(
    <div>
      <button type="button">outside</button>
      <ConfirmDialog
        open
        title="Delete this product?"
        body="It will be removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pending={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...overrides}
      />
    </div>,
  )

  return { ...utils, onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('renders into the document body rather than beside its caller', () => {
    const { container } = setup()

    const dialog = screen.getByRole('alertdialog')

    expect(container).not.toContainElement(dialog)
    expect(document.body).toContainElement(dialog)
  })

  it('renders nothing at all when closed', () => {
    setup({ open: false })

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('describes itself for assistive technology', () => {
    setup()

    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Delete this product?')
    expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription('It will be removed.')
  })

  it('moves focus to the confirming action when it opens', () => {
    setup()

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus()
  })

  it('cancels on Escape', () => {
    const { onCancel } = setup()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('returns focus to where it came from once it closes', () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()

    const { rerender } = render(
      <ConfirmDialog
        open
        title="Delete this product?"
        body="It will be removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pending={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus()

    rerender(
      <ConfirmDialog
        open={false}
        title="Delete this product?"
        body="It will be removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pending={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(outside).toHaveFocus()
    outside.remove()
  })

  it('disables both actions while the deletion is in flight', () => {
    setup({ pending: true })

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })
})
