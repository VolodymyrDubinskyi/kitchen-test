# Kitchen

Products CRUD over the public [dummyJSON](https://dummyjson.com/docs/products) API — list, detail,
create, edit and delete, with search, pagination, image upload, reviews, light/dark theming and
English/Ukrainian localisation.

Next.js (Pages Router) in an Nx monorepo, Yarn 4 workspaces, TypeScript strict.

## Decisions, features, tradeoffs

Up front: I don't agree with every decision below. On a real project a few of these would have gone
to refinement so we could pick the better strategy together — the brief pushed me into them. I've
tried to flag those and say what I'd have done instead.

### 1. Yarn workspaces

The repo is a Yarn workspaces monorepo so that parts of the code live in their own libraries. That
makes them easier to develop and test in isolation, and gives the app room to grow.

Being honest about the size of that win: with a single app, libraries mostly buy you _enforced_
boundaries rather than reuse. A directory becomes a library here only when more than one execution
context needs it — `schemas` is read by Node in the API routes and by the browser in the forms,
`utils` by both, `testing` by the test runner.

### 2. Nx

Three goals:

- **Enforced module boundaries.** `@nx/enforce-module-boundaries` checks the layering on every run of
  the linter, so an import from a lower layer into a higher one fails the build instead of waiting
  for someone to spot it in review.
- **Cached tasks.** A full `typecheck lint test build` takes about 9s cold and 1.2s when nothing
  changed, so re-running it costs nothing and CI only pays for what actually moved.
- **One command for the whole workspace.** `yarn test`, `yarn lint`, `yarn typecheck` run across
  every project instead of being wired per package, and `nx affected` narrows that to what a change
  actually touched.

### 3. Pages Router, not App Router

The brief names `getServerSideProps`, and that function only exists in the Pages Router. Deviating
from an explicitly written requirement costs more than it gains, so I stayed with it.

If we were choosing freely, App Router wins on a few things:

- **Server Components** — data fetching happens in the component and the component itself never
  ships to the browser, so less JavaScript crosses the wire.
- **Streaming** — `loading.tsx` and Suspense let the shell paint immediately while slow parts arrive
  later, instead of the whole page waiting on the slowest query.
- **Nested layouts** — a layout survives navigation between the pages under it, so shared chrome
  doesn't remount and its data isn't refetched.
- **Server Actions** — mutations without hand-writing an API route for each one.

In that case, instead of `getServerSideProps` we would use an async Server Component,
`export const dynamic = 'force-dynamic'` and `redirect()` / `notFound()` from `next/navigation`.

### 4. Context and React Query side by side

There's no sense in using both to hold data that comes from the server — for that job they replace
each other, and you'd only end up keeping two copies of the same thing.

So I split the responsibilities instead. React Query holds everything that comes from the API: the
product list, a single product, and the mutations. Context with `useReducer` holds what the server
never sends — theme, language and notifications. Theme and language are mirrored into cookies, so the
server already knows them on the first response and there's no flash of the wrong one.

### 5. The browser never calls dummyJSON directly

Everything goes to this app's own `/api` routes, which then talk to dummyJSON. Two reasons.

**Security.** Credentials for the upstream never reach the browser. The upstream's address and
response shape stay behind our own contract, so it can be swapped without touching the client. Every
payload is validated in one place before the client sees it, so a change upstream can't reach the UI
unnoticed. And rate limiting or auth would have exactly one place to live.

**Gaps in dummyJSON.** Create, edit and delete return a convincing response but change nothing —
the next `GET` is identical and `total` stays at 194. Left alone the app looks broken, so a small
in-memory layer in `src/server/products` remembers the mutations and merges them into the list before
paginating. Image upload works the same way: no storage in scope, so files are kept in memory and
served from `/api/uploads/:id`, size-capped and type-checked.

(Both live in the server process, so they reset on restart and wouldn't be shared across instances —
fine for a stand-in, and none of it would exist on a real backend.)

### 6. Zod on both sides, React Hook Form for forms

The same schemas validate the API request body and the form, so the two can't drift apart. Doing it
by hand is possible, but I don't see the upside — going without a form manager usually just means
writing more code to end up in the same place.

Two details worth naming:

- React Hook Form is **uncontrolled by default** — `register` leaves the value in the DOM. The brief
  asks for controlled inputs, so every field goes through `<Controller>` instead, which keeps values
  in form state.
- An HTML input can only hold a string, even `type="number"`. Rather than converting on every
  keystroke and keeping two copies of the truth in sync, the form holds the string and Zod converts
  it once, at the same moment it checks the rules — parsing and validating are the same operation, so
  they belong in the same place.

### 7. Where SSR ends and CSR begins

`getServerSideProps` reads `page` and `search` from the URL and renders the first list, so the first
response is complete HTML. After hydration the URL is still the source of truth but the client takes
over: pagination and search rewrite the query string with shallow routing, the React Query key
changes with it, and the fetch happens in the browser. Pagination uses `push` so Back walks through
pages; the debounced search uses `replace` so typing doesn't fill the history.

Handing the server's payload to the cache has two traps, and I fell into both before getting it
right:

- **Seed only the query the server answered.** The key carries the page and the search term, so
  seeding _every_ key means page 2 is born holding page 1's products.
- **Say when the server fetched it.** `initialData` alone stamps "fetched now" at hydration, so with
  a 60s `staleTime` the query is born fresh and never refetches. `initialDataUpdatedAt` measures
  staleness from the server's fetch instead.

Get both wrong and the list silently stops fetching, with no error anywhere — which is why "fetching
happens once when the component mounts" is worth checking in the network panel: zero requests to
`/api` on first paint, the first one only when you page or search.

### 8. The rest of the stack

Nothing surprising, but for completeness:

- **i18next** (via `next-i18next`) — translations, with Next's built-in locale routing so they are
  server-rendered rather than swapped in after hydration. Ukrainian uses plural categories
  (`_one` / `_few` / `_many`), which plain `{{count}}` interpolation can't express.
- **Tailwind** — styling. Dark mode is a `data-theme` attribute on `<html>` rather than
  `prefers-color-scheme`, because the choice is the user's and lives in a cookie.
- **Vitest + Testing Library + MSW** — tests. The fixtures are payloads captured from the live API
  rather than written by hand: a hand-written fixture describes the schema that shaped it, so a
  mismatch with reality stays invisible. That's exactly how I missed that dummyJSON's create response
  has no `rating` field.
- **TypeScript strict**, ESLint and Prettier throughout, with the layering rules described above.

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

| Command             | What it does                |
| ------------------- | --------------------------- |
| `yarn dev`          | Next dev server             |
| `yarn build`        | Build every project         |
| `yarn start`        | Serve the production build  |
| `yarn test`         | Vitest across the workspace |
| `yarn lint`         | ESLint across the workspace |
| `yarn typecheck`    | `tsc` across the workspace  |
| `yarn format`       | Prettier write              |
| `yarn format:check` | Prettier check              |

## Structure

```
apps/web/src/
  pages/               routes and API routes
  server/
    dummyjson/         upstream adapter
    products/          catalogue cache, mutation store, service
    uploads/           in-memory image store
    http/              error envelope and method routing
  features/products/
    api/               fetchers, query keys, React Query hooks
    model/             URL params, delete flow, list route helpers
    ui/                cards, form, gallery, list
  shared/              theme, toasts, i18n, hooks, UI primitives
libs/schemas/          zod schemas and domain types, shared by server and client
libs/utils/            ApiError, price and date formatters
libs/testing/          payloads captured from the live API, MSW handlers, Vitest setup
```

Layering is enforced at lint time by `@nx/enforce-module-boundaries` project tags, and
`no-restricted-imports` keeps `@kitchen/testing` out of production code.
