import Head from 'next/head'
import { useRouter } from 'next/router'

export function LocaleAlternates({ origin }: { origin?: string }) {
  const { asPath, locales, defaultLocale } = useRouter()

  if (!origin || !locales || !defaultLocale) {
    return null
  }

  const path = asPath.split('#')[0] ?? asPath
  const href = (locale: string) =>
    `${origin}${locale === defaultLocale ? '' : `/${locale}`}${path === '/' ? '' : path}` || origin

  return (
    <Head>
      {locales.map(locale => (
        <link key={locale} rel="alternate" hrefLang={locale} href={href(locale)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={href(defaultLocale)} />
    </Head>
  )
}
