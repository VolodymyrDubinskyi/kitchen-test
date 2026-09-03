import type { ReactNode } from 'react'

import Link from 'next/link'

import { useTranslation } from '../i18n'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {t('app.title')}
          </Link>
          <nav className="flex-1">
            <Link href="/products/new" className="text-sm underline underline-offset-4">
              {t('nav.newProduct')}
            </Link>
          </nav>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 focus:outline-none">
        {children}
      </main>
    </div>
  )
}
