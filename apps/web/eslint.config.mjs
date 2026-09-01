import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

import baseConfig from '../../eslint.config.mjs'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  ...baseConfig,
  {
    ignores: ['.next/**/*', '**/out-tsc'],
  },
]

export default eslintConfig
