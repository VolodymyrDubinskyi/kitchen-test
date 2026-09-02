const { join } = require('node:path')

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk'],
  },
  localePath: join(__dirname, 'public', 'locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
