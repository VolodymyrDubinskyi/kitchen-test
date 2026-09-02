import type { ReactElement } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance, type i18n as I18nInstance } from 'i18next'

import common from '../../public/locales/en/common.json'

export function createTestI18n(): I18nInstance {
  const instance = createInstance()

  void instance.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    resources: { en: { common } },
    interpolation: { escapeValue: false },
  })

  return instance
}

export function renderWithI18n(ui: ReactElement) {
  const i18n = createTestI18n()

  return {
    user: userEvent.setup(),
    ...render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>),
  }
}
