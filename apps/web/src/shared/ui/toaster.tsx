import { useTranslation } from '../i18n'
import { useToast, useToasts } from '../toast/toast-context'
import { Portal } from './portal'

const TONES = {
  success:
    'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
  error: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
}

export function Toaster() {
  const toasts = useToasts()
  const { dismiss } = useToast()
  const { t } = useTranslation('common')

  const errors = toasts.filter(toast => toast.tone === 'error')
  const notices = toasts.filter(toast => toast.tone !== 'error')

  return (
    <Portal>
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-72 flex-col gap-2">
        <div role="alert" aria-live="assertive" className="flex flex-col gap-2">
          {errors.map(toast => (
            <ToastRow
              key={toast.id}
              tone={toast.tone}
              toastId={toast.id}
              onDismiss={dismiss}
              label={t('toast.dismiss')}
            >
              {toast.message}
            </ToastRow>
          ))}
        </div>
        <div role="status" aria-live="polite" className="flex flex-col gap-2">
          {notices.map(toast => (
            <ToastRow
              key={toast.id}
              tone={toast.tone}
              toastId={toast.id}
              onDismiss={dismiss}
              label={t('toast.dismiss')}
            >
              {toast.message}
            </ToastRow>
          ))}
        </div>
      </div>
    </Portal>
  )
}

function ToastRow({
  tone,
  label,
  toastId,
  onDismiss,
  children,
}: {
  tone: keyof typeof TONES
  label: string
  toastId: number
  onDismiss: (id: number) => void
  children: string
}) {
  const dismiss = () => onDismiss(toastId)

  return (
    <div
      className={`pointer-events-auto flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm shadow-sm ${TONES[tone]}`}
    >
      <span>{children}</span>
      <button type="button" onClick={dismiss} aria-label={label} className="shrink-0 font-bold">
        ×
      </button>
    </div>
  )
}
