import type { ReactElement } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance, type i18n as I18nInstance } from 'i18next'

import en from '../../public/locales/en/common.json'
import uk from '../../public/locales/uk/common.json'

const bundles = { en, uk }

export type TestLocale = keyof typeof bundles

export function createTestI18n(locale: TestLocale = 'en'): I18nInstance {
  const instance = createInstance()

  void instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    resources: { [locale]: { common: bundles[locale] } },
    interpolation: { escapeValue: false },
  })

  return instance
}

export function renderWithI18n(ui: ReactElement, locale: TestLocale = 'en') {
  const i18n = createTestI18n(locale)

  return {
    user: userEvent.setup(),
    ...render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>),
  }
}
