import Document, { Head, Html, Main, NextScript, type DocumentContext } from 'next/document'

import { readThemeCookie, THEME_COOKIE, type Theme } from '../shared/theme/theme-context'

const APPLY_STORED_THEME = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=(light|dark)/);if(m){document.documentElement.dataset.theme=m[1]}}catch(e){}})()`

type DocumentProps = {
  theme: Theme
  locale: string
}

export default class AppDocument extends Document<DocumentProps> {
  static override async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)

    return {
      ...initialProps,
      theme: readThemeCookie(ctx.req?.headers.cookie),
      locale: ctx.locale ?? 'en',
    }
  }

  override render() {
    return (
      <Html lang={this.props.locale} data-theme={this.props.theme}>
        <Head>
          <script dangerouslySetInnerHTML={{ __html: APPLY_STORED_THEME }} />
        </Head>
        <body className="antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
