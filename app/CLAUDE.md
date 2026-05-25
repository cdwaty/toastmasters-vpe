# CLAUDE.md — toastmasters-web

Contributor cheat-sheet for AI sessions. Deep dive: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).

## What this is
Single-page React app for running a Toastmasters club: members, pathways, meetings, roles, attendance, mentorships, change history, export. Backed by Supabase (Postgres + Auth + RLS).

## Stack
- React 18 + Vite 5 + TypeScript 5 (strict)
- React Router v7 (`react-router`, **not** `react-router-dom`)
- Supabase JS (`@supabase/supabase-js`)
- Forms: React Hook Form + Zod (`@hookform/resolvers`)
- Tailwind CSS — design tokens: `burgundy`, `cream`, `ink`, `success`, `warning`, `danger`, `info`. Serif headings (`font-serif`).
- Dates: `date-fns`; class merging: `clsx`
- Tests: Vitest + Testing Library + jsdom

## Commands
```
npm run dev       # vite dev server
npm run build     # tsc && vite build
npm run lint      # eslint
npm test          # vitest run
npm run test:watch
npm run coverage
```

## Project layout
```
src/
  App.tsx               routes + provider tree
  main.tsx              entry
  components/           AppLayout, Sidebar, Topbar, ProtectedRoute, ErrorBoundary, ConnectionBanner
    ui/                 design system (Button, Card, StatCard, EmptyState, Avatar, Icon, …)
  contexts/             AuthContext, MemberContext, MeetingContext, PathwayContext,
                        ReferenceDataContext, ToastContext
  hooks/                useAsync, useDebounce, …
  lib/
    api/                CRUD per table — each fn returns Promise<Result<T>>
    routes.ts           central route table — ALWAYS use this
    constants.ts        APOLOGY_NOTE, GUEST_MARKER, EMPTY_DISPLAY
    config.ts           ttl/timeout knobs
    result.ts           Result<T,E> type
    format.ts           date helpers
    supabase.ts         client (uses sessionStorage)
    logger.ts           prefer this over console.*
  pages/
    DashboardPage.tsx
    members/  meetings/  auth/  data/
  types/database.ts     hand-typed DB row interfaces (Member, Meeting, Pathway, …)
```

## Hard rules
- **TypeScript strict.** No `any` unless truly unavoidable. Prefer `unknown` + narrow.
- **No new comments** unless the *why* is non-obvious. No docstrings on unchanged fns.
- **Read the file before editing.** When changing a signature, grep every caller.
- **No `console.log`.** Use `logger` from [src/lib/logger.ts](src/lib/logger.ts).
- **No hardcoded paths.** Import from [src/lib/routes.ts](src/lib/routes.ts):
  - `routes.members`, `routes.memberDetail(id)`, `routes.meetings`, `routes.meetingDetail(id)`, `routes.meetingEdit(id)`, `routes.meetingsNew`, `routes.membersAdd`, `routes.membersBulk`, `routes.home`, …
- **No raw magic numbers / strings.** Named const at top of file. `EMPTY_DISPLAY` for "—", `APOLOGY_NOTE` for attendance apology marker, `GUEST_MARKER` for guest-list section in notes.
- **No emojis** in code, commits, UI text (unless user asks).

## Result pattern
Every `lib/api/*` fn returns `Promise<Result<T, E>>` ([src/lib/result.ts](src/lib/result.ts)). Callers MUST branch:
```ts
const result = await listMembers();
if (!result.ok) { toast(result.error.message, 'error'); return; }
const members = result.value;
```
Do **not** throw out of the data layer. Do **not** ignore the `.ok` check.

## Context layering (App.tsx)
Order is load-bearing:
```
ToastProvider
  AuthProvider
    ProtectedRoute
      ReferenceDataProvider (keyed by user.id — refetches on user switch)
        MemberProvider
          MeetingProvider
            PathwayProvider (on-demand via loadForMember)
              AppLayout
```
- `ReferenceDataContext` is **one-shot** (role_types, pathway_types). Refetches only when user changes.
- Member/Meeting contexts load on session ready, expose CRUD that **updates local state after API success**.
- Mutations through `MemberContext` also write change history (`recordMemberHistory`) — diff via [memberDiff.ts](src/lib/api/memberDiff.ts).

## Stale-response guard
Long-list loaders (`MemberContext`, `MeetingContext`, `PathwayContext`) use `refreshIdRef`/`requestIdRef` counter — a late response is dropped if a newer refresh started. Preserve this when editing context loaders.

## UI conventions
- Page shell: `PageHeader` + content; widths handled by `AppLayout`.
- Lists in cards: `Card` > `CardHeader` (children form for title+description) > `CardBody`.
- Loading: `Skeleton`, `CardSkeleton`, `StatCardGridSkeleton`, `PageLoader`, `TableBodySkeleton`.
- Empty: `EmptyState` with `icon`, `title`, `description`, optional `action`.
- Confirm destructive ops: `ConfirmDialog`. Never silently destroy.
- Toasts: `useToast().notify(message, variant?)` from [ToastContext](src/contexts/ToastContext.tsx). Use for mutation outcomes.
- Forms: React Hook Form + Zod resolver. Schemas co-located (`memberSchema.ts`, `meetingSchema.ts`).
- Icons: import from `components/ui` (custom SVG set in `Icon.tsx`). No external icon lib.

## Naming
- Variables/functions: `camelCase`
- Types / interfaces / components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.tsx` for pages/components, except top-level pages that follow `PascalCasePage.tsx`
- Booleans: `is*`, `has*`, `can*`

## Auth notes
- Session held in **`sessionStorage`** — closing tab logs out (intentional).
- Idle auto-logout: 1 hour (configurable in [config.ts](src/lib/config.ts)).
- Errors mapped via [authErrors.ts](src/lib/authErrors.ts); don't surface raw Supabase messages to users.

## DB / SQL
- Schema, migrations, and seeds live in [../sql/](../sql/) (sibling of `toastmasters-web`).
- **Do NOT modify SQL, schema, or seed data without explicit user approval.**
- RLS is enabled everywhere — when adding a new query, also confirm a matching policy exists.

## Tests
- Unit tests sit next to source: `format.test.ts`, `meetingSchema.test.ts`, etc.
- Run `npm test` before reporting work as done when logic changes.
- For UI changes also verify in the dev server — type-check ≠ feature works.

## Common pitfalls
- `toISOString().slice(0,10)` returns **UTC** date — wrong for NZ TZ near midnight when comparing local `YYYY-MM-DD` columns (`paid_until`, `meeting_date`). Build the local-date string from `getFullYear/getMonth/getDate` instead.
- Don't use `react-router-dom` — repo uses `react-router` v7.
- `useEffect` deps: contexts return new array refs on each refresh. Memoize derived lists with `useMemo` keyed on the context array.
- `Promise.allSettled` is used for best-effort batches (history writes, bulk updates). Log warnings, don't fail the caller.

## When extending
- New API call → add to matching `lib/api/<table>.ts`, return `Result`.
- New page route → register in [App.tsx](src/App.tsx) **and** [routes.ts](src/lib/routes.ts). Add sidebar entry in [Sidebar.tsx](src/components/Sidebar.tsx) if user-facing.
- New context → add to provider tree in App.tsx at correct nesting level.
- New table column on existing entity → update [types/database.ts](src/types/database.ts) hand-typed interface.
