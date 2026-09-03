import { useCallback, useEffect, useId, useRef } from 'react'

import { Button } from './button'
import { Portal } from './portal'

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

type ConfirmDialogProps = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  cancelLabel: string
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  pending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const cancelRef = useRef(onCancel)
  const titleId = useId()
  const bodyId = useId()

  useEffect(() => {
    cancelRef.current = onCancel
  }, [onCancel])

  const trapFocus = useCallback((event: KeyboardEvent) => {
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)

    if (!focusable || focusable.length === 0) {
      event.preventDefault()
      dialogRef.current?.focus()

      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    cancelButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelRef.current()
      }

      if (event.key === 'Tab') {
        trapFocus(event)
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)

      const opener = restoreRef.current

      if (opener?.isConnected) {
        opener.focus()
      } else {
        document.querySelector('main')?.focus()
      }
    }
  }, [open, trapFocus])

  if (!open) {
    return null
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={bodyId}
          className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg dark:bg-zinc-900"
        >
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <p id={bodyId} className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {body}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              ref={cancelButtonRef}
              variant="secondary"
              type="button"
              onClick={onCancel}
              disabled={pending}
            >
              {cancelLabel}
            </Button>
            <Button variant="danger" type="button" onClick={onConfirm} disabled={pending}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
