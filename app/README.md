# Toastmasters — React + Vite + Supabase

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev                     # http://localhost:5173
```

### Environment variables

Set in `.env.local` (Vite reads this automatically):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Both are required — `src/lib/supabase.ts` throws on module load if either is missing.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on http://localhost:5173 |
| `npm run build` | Type-check (`tsc`) then bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `*.ts` / `*.tsx` |
| `npm test` | Run all unit tests once (vitest) |
| `npm run test:watch` | Vitest in watch mode (re-runs on file change) |
| `npm run coverage` | Run tests + print coverage table + write HTML report to `coverage/` |

## Running unit tests

Tests live next to the code they cover (`*.test.ts` / `*.test.tsx`). Stack: **vitest** + **@testing-library/react** + **jsdom**.

```bash
npm test                      # one-shot, exits with 0/1
npm run test:watch            # TDD loop
npm run coverage              # text summary + HTML at coverage/index.html
```

Run a single file or pattern:

```bash
npx vitest run src/lib/api/members.test.ts
npx vitest run --grep "validateEmail"
```

### Current coverage

```
Statements   92.68%   Functions   98.13%
Lines        96.76%   Branches    79.37%
```

262 tests across 32 files. Coverage is measured against pure-logic code (`*.ts` files) — UI components (`*.tsx`), contexts, auth pages, and migration scripts are excluded in [vitest.config.ts](vitest.config.ts) because they need integration / E2E testing rather than unit tests.

### What's tested

- `src/utils/*` — validation, fuzzy matching, location merging
- `src/hooks/*` — `useAsync` (incl. stale-resolve guard), `useDebounce`, `useBeforeUnload`
- `src/lib/*` — `result`, `format`, `logger`, `authErrors`, `errors/*`, `connectionMonitor`
- `src/lib/api/*` — every API function, query construction + error paths (supabase mocked via `src/test/supabaseMock.ts`)
- `src/lib/export/*` — CSV + legacy export builders
- `src/lib/import/*` — pathway HTML parser + matcher + importer
- `src/pages/meetings/*.ts` — form helpers, role groups, persistence, Zod schema
- `src/pages/members/memberSchema.ts` + `pathwayStats.ts`

### Writing a new test

1. Place `foo.test.ts` next to `foo.ts`.
2. Pure function? Just import and assert.
3. Touches Supabase? Mock it with the chainable helper:

```ts
import { vi, beforeEach } from 'vitest';
import { makeChain } from '../../test/supabaseMock';

vi.mock('../supabase', () => ({ supabase: { from: vi.fn() } }));

import { supabase } from '../supabase';
const from = supabase.from as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

it('does the thing', async () => {
  from.mockReturnValue(makeChain({ data: [...], error: null }));
  // ...
});
```

4. React hook? Use `renderHook` from `@testing-library/react`.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **React Router v7**
- **Supabase** (`@supabase/supabase-js`) — Postgres + Auth + RLS
- **Tailwind CSS**
- **React Hook Form** + **Zod**
- **date-fns**, **clsx**
- **vitest** + **@testing-library/react** for tests

## Auth behaviour

`src/lib/supabase.ts` uses `sessionStorage` (not localStorage) so closing the tab ends the session. `AuthContext` also signs out after 1 hour of inactivity (with a `visibilitychange` listener to catch background-throttled tabs).

## Database

Supabase tables: `members`, `pathways`, `pathway_types`, `pathway_levels`, `pathway_projects`, `project_completions`, `level_awards`, `mentorships`, `meetings`, `role_types`, `meeting_roles`, `meeting_attendance`, `change_history`. All with RLS enabled. SQL lives in the `sql/` directory at the repo root.

## Source layout

```
src/
  main.tsx · App.tsx
  lib/
    supabase.ts             · client + session config
    result.ts               · Result<T,E> wrapper
    logger.ts               · structured console logger
    api/                    · CRUD functions per table (all return Result<T>)
    errors/                 · message mapping, AppError type
    export/ · import/       · CSV + legacy JSON, HTML pathway parser
  contexts/                 · Auth, Member, Meeting, Pathway, ReferenceData, Toast
  hooks/                    · useAsync, useDebounce, useBeforeUnload
  components/
    ui/                     · Button, Modal, TextInput, Pagination, …
    AppLayout, ProtectedRoute, Sidebar, Topbar, ErrorBoundary
  pages/
    auth/                   · Login, ForgotPassword, ResetPassword, AcceptInvite
    members/                · Roster, Detail (pathways, mentorship, history), Bulk update
    meetings/               · List, Detail, Form, Attendance, Roles
    DashboardPage, Stubs
  utils/                    · validation, fuzzy matching, locations
  test/                     · supabaseMock.ts, setup.ts
  types/                    · domain types
```

## Troubleshooting

**`Missing Supabase env vars`** — create `.env.local` with both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

**Tests hang or time out** — check for `vi.useFakeTimers()` interacting with `waitFor` (which uses real timers). Either drop fake timers for that test, or advance them manually with `vi.advanceTimersByTime()`.

**Coverage shows 0% for files you tested** — coverage excludes `*.tsx`, `contexts/`, `pages/auth/`, `lib/migration/`, `types/`. Tweak the exclude list in [vitest.config.ts](vitest.config.ts).
