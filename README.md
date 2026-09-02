# Kitchen

Products CRUD over the public [dummyJSON](https://dummyjson.com/docs/products) API — list, detail,
create, edit and delete, with light/dark theming and English/Ukrainian localisation.

Next.js (Pages Router) in an Nx monorepo, Yarn 4 workspaces, TypeScript strict.

## Requirements

- Node `v22` (see `.nvmrc`)
- Yarn 4 via Corepack — `corepack enable`

## Setup

```bash
yarn install
cp .env.example .env
yarn dev
```

The app runs on http://localhost:3000. Ukrainian is at `/uk`.

## Commands

| Command          | What it does                |
| ---------------- | --------------------------- |
| `yarn dev`       | Next dev server             |
| `yarn build`     | Build every project         |
| `yarn start`     | Serve the production build  |
| `yarn test`      | Vitest across the workspace |
| `yarn lint`      | ESLint across the workspace |
| `yarn typecheck` | `tsc` across the workspace  |
| `yarn format`    | Prettier write              |

## Structure

```
apps/web/
  src/pages/             routes and API routes
  src/server/            server-only: dummyJSON adapter and HTTP helpers
  src/features/products/ api (fetchers, query keys, hooks), model (URL params hook), ui
  src/shared/            theme, toasts, i18n, hooks, UI primitives
libs/schemas/           zod schemas and domain types, shared by server and client
libs/utils/             ApiError and formatters
libs/testing/           payloads captured from the live API, MSW handlers, Vitest setup
```

Layering is enforced at lint time by `@nx/enforce-module-boundaries` project tags, and
`no-restricted-imports` keeps `@kitchen/testing` out of production code.
