import type { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import { I18N_NAMESPACE, useTranslation } from '../shared/i18n'
import { serverSideTranslations } from '../shared/i18n/server'
import { Layout } from '../shared/ui/layout'

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale ?? 'en', [I18N_NAMESPACE]),
})

export default function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <Layout>
      <Head>
        <title>{`${t('errors.pageNotFound')} — ${t('app.title')}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <h1 className="text-2xl font-semibold tracking-tight">{t('errors.pageNotFound')}</h1>
      <Link href="/" className="mt-4 inline-block text-sm underline underline-offset-4">
        {t('products.back')}
      </Link>
    </Layout>
  )
}
