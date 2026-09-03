import nx from '@nx/eslint-plugin'
import prettier from 'eslint-config-prettier/flat'

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  prettier,
  {
    ignores: ['**/dist', '**/out-tsc', '**/.next', '**/coverage'],
  },
  {
    files: ['**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:schemas', 'type:util', 'type:testing'],
            },
            { sourceTag: 'type:schemas', onlyDependOnLibsWithTags: ['type:util', 'type:testing'] },
            { sourceTag: 'type:util', onlyDependOnLibsWithTags: [] },
            { sourceTag: 'type:testing', onlyDependOnLibsWithTags: [] },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    ignores: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/tests/**',
      '**/vite.config.mts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@kitchen/testing', '@kitchen/testing/*'],
              message: 'Test doubles must not be imported from production code.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/features/**/*.{ts,tsx}', '**/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/server/**'],
              message: 'Server-only modules must not be imported from client code.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-nested-ternary': 'error',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'smart'],
    },
  },
]
