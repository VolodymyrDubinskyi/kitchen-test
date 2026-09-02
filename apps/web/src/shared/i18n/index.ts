export { appWithTranslation, useTranslation } from 'next-i18next/pages'

export const I18N_NAMESPACE = 'common'
export const LOCALES = ['en', 'uk'] as const

export type Locale = (typeof LOCALES)[number]
