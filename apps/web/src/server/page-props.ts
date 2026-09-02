import type { GetServerSidePropsContext } from 'next'

import { I18N_NAMESPACE } from '../shared/i18n'
import { serverSideTranslations } from '../shared/i18n/server'
import { readThemeCookie, type Theme } from '../shared/theme/theme-context'

type Translations = Awaited<ReturnType<typeof serverSideTranslations>>

export type SharedPageProps = Translations & {
  theme: Theme
}

export async function sharedPageProps(ctx: GetServerSidePropsContext): Promise<SharedPageProps> {
  return {
    theme: readThemeCookie(ctx.req.headers.cookie),
    ...(await serverSideTranslations(ctx.locale ?? 'en', [I18N_NAMESPACE])),
  }
}
