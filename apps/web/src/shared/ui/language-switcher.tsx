import type { ChangeEvent } from 'react'

import { useRouter } from 'next/router'

import { LOCALES, useTranslation, type Locale } from '../i18n'

const LOCALE_COOKIE_MAX_AGE = 31_536_000

export function LanguageSwitcher() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const current = (router.locale ?? 'en') as Locale

  const changeLocale = (event: ChangeEvent<HTMLSelectElement>) => {
    document.cookie = `NEXT_LOCALE=${event.target.value}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`

    void router.push({ pathname: router.pathname, query: router.query }, undefined, {
      locale: event.target.value,
    })
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t('language.label')}</span>
      <select
        value={current}
        onChange={changeLocale}
        className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        {LOCALES.map(locale => (
          <option key={locale} value={locale}>
            {t(`language.${locale}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
