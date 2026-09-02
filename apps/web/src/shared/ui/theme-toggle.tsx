import { useTranslation } from '../i18n'
import { useTheme } from '../theme/theme-context'
import { Button } from './button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation('common')

  return (
    <Button variant="secondary" onClick={toggleTheme} aria-label={t('theme.label')}>
      {theme === 'light' ? t('theme.dark') : t('theme.light')}
    </Button>
  )
}
