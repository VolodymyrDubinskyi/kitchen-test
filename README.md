# Kitchen

Products CRUD over the public [dummyJSON](https://dummyjson.com/docs/products) API.

This is the initial structure of the project — an Nx monorepo with a Next.js application,
tooling and tests wired up. The product features are not implemented yet.

## Requirements

- Node `v22` (see `.nvmrc`)
- Yarn 4 via Corepack — `corepack enable`

## Setup

```bash
yarn install
cp .env.example .env
yarn dev
```

The app runs on http://localhost:3000.

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
