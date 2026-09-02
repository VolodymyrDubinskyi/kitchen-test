import { useTranslation } from '../i18n'
import { Button } from './button'

export function AppError() {
  const { t } = useTranslation('common')

  const reload = () => window.location.reload()

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-xl font-semibold">{t('errors.generic')}</h1>
      <Button type="button" onClick={reload}>
        {t('errors.retry')}
      </Button>
    </main>
  )
}
