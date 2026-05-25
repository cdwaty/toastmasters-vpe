# Toastmasters Web — Project Overview

Single-page React app for running a Toastmasters club: members, pathways (Toastmasters education track), meetings, role assignments, attendance, mentorships, change history, and data export.

Built on **React 18 + Vite + TypeScript**, backed by **Supabase** (Postgres + Auth + RLS).

---

## 1. Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18, Vite 5 |
| Language | TypeScript 5 (strict) |
| Routing | React Router v7 (`react-router`) |
| Backend | Supabase (`@supabase/supabase-js`) — Postgres, Auth, RLS |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Styling | Tailwind CSS (custom design tokens: burgundy / cream / ink palette, serif headings) |
| Dates | `date-fns` |
| Utility | `clsx` for class merging |
| Testing | Vitest + Testing Library + jsdom |

Result-type wrapper (`Result<T, E>` in [src/lib/result.ts](src/lib/result.ts)) used by every API call — no thrown errors out of the data layer; consumers branch on `result.ok`.

---

## 2. Entry Points & App Shell

### [src/main.tsx](src/main.tsx) → [src/App.tsx](src/App.tsx)

`App.tsx` defines all routes and the provider nesting. Public routes (login etc.) sit outside `<ProtectedRoute>`. Everything else lives inside `AuthenticatedShell` which wraps the app in **5 context providers** (order matters — see below).

```
<ErrorBoundary>
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>           ← session, idle timeout, sign-in
        <Routes>
          public routes
          <ProtectedRoute>
            <ReferenceDataProvider>   ← role_types, pathway_types (one-time fetch)
              <MemberProvider>        ← members list + CRUD
                <MeetingProvider>     ← meetings list + CRUD
                  <PathwayProvider>   ← per-member pathway data, loaded on demand
                    <AppLayout>       ← sidebar + topbar + <Outlet/>
```

Note `<ReferenceDataProvider key={user?.id ?? 'anon'}>` — reference data refetches on user switch.

### Routes ([src/lib/routes.ts](src/lib/routes.ts))

| Path | Page | Purpose |
|---|---|---|
| `/login`, `/forgot-password`, `/reset-password`, `/auth/callback` | `pages/auth/*` | Auth flows (Supabase magic link / password) |
| `/` | `DashboardPage` | KPI cards + upcoming meetings + members needing attention |
| `/members` | `RosterPage` | Search/filter/sort/paginate member table |
| `/members/add` | `AddMemberPage` | New-member form |
| `/members/bulk` | `BulkUpdatePage` | Pick field → pick members → write same value to all |
| `/members/:id` | `MemberDetailPage` | Tabs: Profile / Pathways / Mentorship + History sidebar |
| `/meetings` | `MeetingsPage` | Card list grouped by month, with stats |
| `/meetings/new`, `/meetings/:id/edit` | `MeetingFormPage` | Build meeting + assign roles + attendance |
| `/meetings/:id` | `MeetingDetailPage` | Read-only meeting view (roles/attendance/notes/guests tabs) |
| `/data/export` | `ExportPage` | Full JSON snapshot or members CSV |
| `/reports`, `/admin` | `Stubs.tsx` | Placeholders |

Wildcard route redirects to `/`.

---

## 3. Auth ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx))

- Session held in **`sessionStorage`** (not localStorage) → closing tab kills login ([src/lib/supabase.ts:21-28](src/lib/supabase.ts)).
- `getSession()` on mount + `onAuthStateChange` subscription keeps `user`/`session` state in sync.
- **Idle auto-logout**: 1 hour (configurable via [src/lib/config.ts](src/lib/config.ts)). Listens to `mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll` to update `lastActivityRef`. Interval polls; `visibilitychange` listener catches background-throttled tabs.
- Methods: `signIn`, `signOut`, `resetPassword`, `updatePassword`.
- `<ProtectedRoute>` redirects unauthenticated users to `/login`.

Auth error mapping in [src/lib/authErrors.ts](src/lib/authErrors.ts).

---

## 4. Data Layer ([src/lib/api/](src/lib/api/))

Every function returns `Promise<Result<T>>`. Caller pattern: `if (!result.ok) { setError(result.error.message); return; }`.

### [members.ts](src/lib/api/members.ts)
`listMembers`, `createMember`, `updateMember`, `deleteMember`, `bulkUpdateMembers(ids, patch)`.

### [meetings.ts](src/lib/api/meetings.ts)
`listMeetings`, `createMeeting`, `updateMeeting`, `deleteMeeting`. Plus:
- `listMeetingRoles`, `upsertMeetingRole`, `deleteMeetingRole`
- `listAttendance`, `upsertAttendance` (conflict on `meeting_id,member_id`)
- `countAttendanceForMember` — uses `head: true` count for cheap query.
- `listMeetingSummaries(ids)` — batch fetch roles + attendance for many meetings, builds a `Map<meetingId, MeetingSummary>` (toastmaster, chair, speakers ordered by slot, rolesAssigned count, attended count, apologies count via `APOLOGY_NOTE` constant). Used by `MeetingsPage` to populate per-card stat row.

### [pathways.ts](src/lib/api/pathways.ts)
CRUD over four tables: `pathways`, `project_completions`, `level_awards`, plus listing for one member or many pathway ids.
- `setLevelAwardDate(pathwayId, level, date)` — find-then-update-or-insert (no native upsert, since unique key is composite).

### [mentorships.ts](src/lib/api/mentorships.ts)
Validates memberId with UUID regex before composing `.or('mentor_id.eq.X,mentee_id.eq.X')` query (defense against PostgREST filter injection).

### [changeHistory.ts](src/lib/api/changeHistory.ts)
`listMemberHistory(memberId)` (last 100, newest first). `recordMemberHistory(memberId, entries[])` — bulk insert; warns via logger but does not abort caller flow.

---

## 5. State / Contexts

### `MemberContext` ([src/contexts/MemberContext.tsx](src/contexts/MemberContext.tsx))
- Loads members on session ready. **Stale-response guard** via `refreshIdRef` counter — late responses dropped if a newer refresh started.
- `addMember` / `updateMember` / `deleteMember` / `bulkUpdate` — all do optimistic-ish local state update after API succeeds.
- Wraps mutations with **change-history writes**:
  - `addMember` → records "Member added to roster" event.
  - `updateMember` → diffs old vs patch via [memberDiff.ts](src/lib/api/memberDiff.ts), writes one row per changed field.
  - `bulkUpdate` → per-member diff in parallel via `Promise.allSettled`, warns if any history write failed (best-effort), then refreshes full list.

### `MeetingContext`
Mirrors `MemberContext` shape but no history side-effects. Same stale-guard pattern.

### `PathwayContext` ([src/contexts/PathwayContext.tsx](src/contexts/PathwayContext.tsx))
Loaded on demand via `loadForMember(memberId)`. Holds 3 slices: `pathways`, `completions`, `awards`. After loading parent pathways, fetches completions+awards in parallel for all pathway ids. Stale-guard via `requestIdRef`.
- `setPrimaryPathway(id)` — promotes target; if a previous primary exists, demotes it. If demote fails, logs warning that member has two primaries until next save.
- `addPathway` / `deletePathway` write change-history entries naming the pathway type.
- `upsertCompletion`, `deleteCompletion`, `setLevelAwardDate`, `removeLevelAward` keep local arrays in sync.

### `ReferenceDataContext`
One-shot loader for `role_types` + `pathway_types` with nested `pathway_levels(*, pathway_projects(*))`. Sorts levels by `level_number` and projects by `sort_order` post-fetch. Refetches when user changes (parent `key` prop).

### `ToastContext`
Lightweight `notify(message, variant?)` system used everywhere mutations happen.

---

## 6. Pages — Functional Walkthrough

### `DashboardPage` ([src/pages/DashboardPage.tsx](src/pages/DashboardPage.tsx))
Pure read of `members` + `meetings` context.
- **KPI row** — 4 `<StatCard>` tiles: Members, Internal, External, Meetings. `<StatCardGridSkeleton>` while loading.
- **Upcoming meetings** — next `UPCOMING_LIMIT` (5) meetings where `meeting_date >= today`, sorted ascending. Each row links to `/meetings/:id`.
- **Members needing attention** — active members (`!exit_date`) whose `paid_until` is past today (Expired) or within `EXPIRING_WINDOW_DAYS` (30) (Expiring). Sorted by `paid_until` ascending. Row links to `/members/:id`.
- Shared section shell via local `<DashboardSection>` generic — handles header + "View all" link + skeleton + empty state + list. Reused for both lists.

### `RosterPage` ([src/pages/members/RosterPage.tsx](src/pages/members/RosterPage.tsx))
- Pulls members from context, **plus** loads ALL pathways once via `useAsync(listAllPathways)` to show pathway badges in table.
- Filter state: search (debounced 300ms), member type, location, club, show-inactive toggle.
- Sort: client-side, toggleable column + direction.
- Pagination: 15/page.
- Delete: `<DeleteMemberDialog>` confirms, calls `deleteMember`, toasts result.
- Sub-components: [`RosterStatsRow`](src/pages/members/roster/RosterStatsRow.tsx), [`RosterFilters`](src/pages/members/roster/RosterFilters.tsx), [`MembersTable`](src/pages/members/roster/MembersTable.tsx), [`DeleteMemberDialog`](src/pages/members/roster/DeleteMemberDialog.tsx).
- Location options come from `mergeLocations()` ([src/utils/locations.ts](src/utils/locations.ts)) — combines default Auckland-ish list with any custom strings present in the data.

### `MemberDetailPage` ([src/pages/members/MemberDetailPage.tsx](src/pages/members/MemberDetailPage.tsx))
- Top card: avatar + name + email/phone + badges (member type, club, active/inactive, education award) + meta grid (joined, paid until, location, attendance count via `countAttendanceForMember`).
- 3 tabs:
  1. **Profile** — `<MemberForm>` (also used for add). On save calls `updateMember` (triggers diff history); bumps `historyVersion` to refresh sidebar.
  2. **Pathways** — `<PathwaysTab>` → loads via `PathwayContext.loadForMember`. Renders one `<PathwayCard>` per pathway. Card shows current level, completion %, list of levels + projects via `<ProjectSection>`. `<AddPathwayDialog>` to attach a new pathway.
  3. **Mentorship** — `<MentorshipTab>` lists mentors + mentees (filtered by mentor_id/mentee_id). Adds new mentorship from dropdown of unlinked active members, deletes with confirm.
- Sidebar: `<HistoryCard>` paginated change history list.

### `MemberForm` ([src/pages/members/MemberForm.tsx](src/pages/members/MemberForm.tsx))
RHF + Zod schema in `memberSchema.ts`. Fields: full_name (required), email, phone, location (select from `DEFAULT_LOCATIONS`), member_type (Internal/External), club_preference (Tahi/Yarning Circle/Both), join_date (required), paid_until, exit_date, education_award. `useBeforeUnload` warns on tab close when dirty. Includes optional live `<MemberPreviewCard>` aside that reads `useWatch()` to render a real-time preview avatar/badges.

### `BulkUpdatePage`
Pick field (paid_until / location / club_preference / exit_date), pick value (or "clear exit_date" checkbox), filter+select members, submit → `bulkUpdate(ids, patch)`.

### `MeetingsPage` ([src/pages/meetings/MeetingsPage.tsx](src/pages/meetings/MeetingsPage.tsx))
- 4 stat cards: total, upcoming (`meeting_date >= today`), published, drafts.
- Filters: title search (debounced), meeting type, status, date range.
- Pagination 5/page, **then grouped by month** within page slice.
- Each `<MeetingCard>` shows date plate (month/day/year), title, weekday, plus summary stats fetched in batch via `listMeetingSummaries(paginatedIds)`. Stats: roles assigned, attended, apologies, guests (parsed from notes blob via `splitNotesAndGuests` + `parseGuestList`).
- Type/status badges colour-coded (Special = star icon; Published = green check).

### `MeetingFormPage` ([src/pages/meetings/MeetingFormPage.tsx](src/pages/meetings/MeetingFormPage.tsx)) — the heaviest page

Used for both new and edit. RHF + zod (`meetingSchema`). Notes column stores both notes and guest list — `splitNotesAndGuests` / `mergeNotesWithGuests` split on a sentinel divider.

**Role assignment state model:**
- `roleSlots: Record<roleTypeId, (memberId | null)[]>` — supports multi-slot roles (Speaker, Evaluator, Backup Speaker, TT Speaker, TT Evaluator — see `MULTI_SLOT_KEYS` in [roleGroups.ts](src/pages/meetings/roleGroups.ts)).
- Initial slots built from `roleTypes` × existing `meeting_roles` rows via `buildInitialSlots`.
- Roles grouped UI-side by `ROLE_GROUPS`: Programme, Speakers, Table Topics, Evaluation.

**Auto-attendance linkage** (effect at line 134-169):
- When you assign a member to a role and they have no attendance entry yet → auto-marks them `'attended'` and records them in `autoMarkedRef`.
- If you later remove them from all roles and you never manually toggled them → un-marks (back to `null`).
- `userTouchedRef` tracks members the user manually toggled — these are exempt from auto-mark logic.

**Dirty tracking + unload guard:**
- `computeRolesDirty` / `computeAttendanceDirty` compare current state vs originals.
- `useBeforeUnload(hasUnsavedChanges && !justSavedRef.current)` — browser confirm on close.
- Internal "Back to Meetings" button opens `<ConfirmDialog>` if dirty.

**Save sequence:**
1. Upsert/insert meeting row (returns id).
2. `persistRoles` ([meetingPersistence.ts](src/pages/meetings/meetingPersistence.ts)) — diff against `originalRoles`, insert new, update changed, delete removed.
3. If roles succeed, `persistAttendance` — same diff pattern on `meeting_attendance` upserts.
4. Partial-failure toast tells user roles or attendance failed but form state preserved.

Right sidebar: status radio (Draft/Published), Save button, `<RolesFilledCard>` live summary, `<AttendanceSidebar>` per-member attended/apology toggle (3-state: null → attended → null, or null → apology → null).

### `MeetingDetailPage`
Read-only counterpart. Tabs: Roles (`<RolesView>` groups assignments by `ROLE_GROUPS`), Attendance (`<AttendanceList>` — also lets you toggle attendance inline post-meeting), Notes (just renders notes blob), Guests (chips from parsed guest list). Delete with `<ConfirmDialog>` mentioning role and attendance row counts.

### `ExportPage` ([src/pages/data/ExportPage.tsx](src/pages/data/ExportPage.tsx))
- **JSON**: `fetchSnapshot()` parallel-fetches all 13 tables → `buildLegacyExport()` shapes into legacy JSON (see [legacy.ts](src/types/legacy.ts)) → download.
- **CSV**: members-only flat CSV via `membersToCsv` ([membersCsv.ts](src/lib/export/membersCsv.ts)).
- Filename suffix from `timestampSuffix()`. Toast on success/fail.

---

## 7. Cross-cutting Concerns

### Hooks ([src/hooks/](src/hooks/))
- `useAsync(fn, deps)` — turns an async function into `{ data, loading, error, reload }`. Internal request-id guards against stale resolves when deps change.
- `useDebounce(value, delay=300)` — standard.
- `useBeforeUnload(when)` — registers `beforeunload` listener while `when` is true.

### UI Library ([src/components/ui/](src/components/ui/))
Re-exported from `index.ts`. ~22 components covering Button, Card, Modal, ConfirmDialog, Tabs, Table, TextInput, Select, FormField, Badge, Avatar, Pagination, EmptyState, Spinner, Skeleton (several variants), StatCard, PageHeader, ProgressBar, Accordion, FileDrop, PageLoader, Icon (lucide-style local SVGs). Uses `INPUT_BASE` class string from `styles.ts` for input parity.

### Layout
- `<AppLayout>`: responsive shell, sidebar collapses on mobile, `<Topbar>` shows page + user, `<Outlet>` renders matched route.
- `<Sidebar>` ([components/Sidebar.tsx](src/components/Sidebar.tsx)) — hard-coded nav sections (Members, Meetings, Coming Soon: Attendance/DCP Goals as disabled stubs, Data: Export). User card at bottom with sign out.
- `<ConnectionBanner>` — uses [connectionMonitor.ts](src/lib/connectionMonitor.ts) to show offline/Supabase-down notice.
- `<ErrorBoundary>` wraps the whole app — catches render errors and shows a fallback.

### Errors ([src/lib/errors/](src/lib/errors/))
`errorTypes.ts` defines `AppError`. `errorMessages.ts` maps Postgres/PostgREST error codes (`23505` unique violation, `23503` FK, `42501` RLS) to friendly strings. `errorHandler.ts` is a central translator.

### Logging ([src/lib/logger.ts](src/lib/logger.ts))
Structured console wrapper with `info/warn/error/setUser`. Not console.log directly — easy to swap to remote sink.

### Utils
- `validation.ts` — email / phone regex helpers.
- `fuzzyMatch.ts` — token-overlap based `bestMatch(query, candidates, keyFn)`. Used by pathway HTML import to fuzzy-link names against members + pathway types.
- `locations.ts` — `DEFAULT_LOCATIONS` + `mergeLocations` (preserve order, dedupe case-insensitive).

### Import ([src/lib/import/](src/lib/import/))
- `pathwayHtml.ts` parses Toastmasters export HTML into `PathwayHtmlEntry[]` (member name, pathway name, level, project name, date, title).
- `pathwayImport.ts`:
  - `matchPathwayEntries` — groups entries by `member::pathway`, fuzzy-matches member (with alias override) and pathway type. Thresholds: member 0.6, pathway 0.5.
  - `importMatchedPathways` — creates Pathway if absent, inserts `project_completions` (level 1-5 only), writes change-history "Pathway data imported via HTML file".

### Migration ([src/lib/migration/importLegacyData.ts](src/lib/migration/importLegacyData.ts))
One-shot script to seed Supabase from the legacy JSON export file. Used during initial migration from the old standalone HTML app (`Toastmasters.html` in project root).

---

## 8. Database Schema

Tables (Postgres via Supabase, all with RLS):

| Table | Purpose | Key fields |
|---|---|---|
| `members` | Roster | full_name, email, phone, location, member_type, club_preference, join_date, exit_date, paid_until, education_award, aliases[] |
| `pathway_types` | Reference: education paths (Visionary Communication, etc.) | pathway_name, sort_order, is_active |
| `pathway_levels` | Reference: 5 levels per pathway | pathway_type_id, level_number |
| `pathway_projects` | Reference: project list per level | pathway_level_id, project_name, sort_order |
| `pathways` | A member's enrolment in a pathway | member_id, pathway_type_id, is_primary, current_level, start_date |
| `project_completions` | Speeches done | pathway_id, level, project_name, completion_date, speech_title, evaluator_*, speech_number |
| `level_awards` | When a level was awarded | pathway_id, level, awarded_date |
| `mentorships` | Mentor/mentee pairs | mentor_id, mentee_id, start_date, end_date |
| `meetings` | Sessions | meeting_date, title, meeting_type (Regular/Special), status (Draft/Published), notes |
| `role_types` | Reference: 16 roles (chair, toastmaster, speaker, …) | role_key, display_name, sort_order, is_active |
| `meeting_roles` | Slot assignment | meeting_id, role_type_id, slot_order, member_id |
| `meeting_attendance` | Attended / apology | meeting_id, member_id, attended (bool), notes (`APOLOGY_NOTE` sentinel for apologies) |
| `change_history` | Audit log per member | member_id, timestamp, label, old_value, new_value |

Domain types in [src/types/database.ts](src/types/database.ts); legacy JSON shapes in [src/types/legacy.ts](src/types/legacy.ts).

---

## 9. Testing

262 tests across 32 files. Pure-logic only — components, contexts, auth pages, migration excluded ([vitest.config.ts](vitest.config.ts)). Supabase mocked via chainable helper [src/test/supabaseMock.ts](src/test/supabaseMock.ts).

Coverage: Statements 92.68% / Functions 98.13% / Lines 96.76% / Branches 79.37%.

---

## 10. End-to-end Data Flow (example: Edit a member)

1. User navigates `/members/:id`. `MemberContext` already has the member loaded; `getMember(id)` is synchronous.
2. User edits Profile tab, hits Save.
3. `MemberForm.onSubmit` → `MemberDetailPage` calls `updateMember(id, values)`.
4. Context: calls `membersApi.updateMember` → Supabase `update` returns updated row.
5. On success, replaces row in local state, then calls `diffMember(prev, patch)` to compute changed fields.
6. `recordMemberHistory(id, entries)` inserts one row per changed field into `change_history`.
7. Page bumps `historyVersion` → `HistoryCard` (using `useAsync` with `historyVersion` in deps) re-fetches latest 100 events.
8. `notify(...)` triggers a toast.

---

## 11. Build / Run

```bash
npm install
cp .env.example .env.local   # set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev                  # http://localhost:5173
npm run build                # tsc + vite bundle → dist/
npm run preview              # serve dist/
npm test                     # vitest
npm run coverage             # text + HTML report at coverage/
```

Required env vars throw at module load if missing ([src/lib/supabase.ts](src/lib/supabase.ts)).
