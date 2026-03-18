# Code Review: Phase 02 (Learning Lab) + Phase 03 (Project Workshop)

**Date:** 2026-03-18
**Reviewer:** code-reviewer agent
**Scope:** 44 files across server actions, shared components, admin components, and page components

---

## Overall Score: 8.0 / 10

Solid implementation — consistent auth patterns, good XSS hygiene, well-scoped files. Three actionable issues worth fixing before production: two ESLint errors and two security gaps in server actions.

---

## Scope

| Area | Files |
|---|---|
| Server actions | `src/lib/actions/` (7 files) |
| Spaced repetition | `src/lib/review/spaced-repetition.ts` |
| Shared components | `src/components/shared/markdown-editor.tsx` |
| Admin notes | `src/components/admin/notes/` (6 files) |
| Admin review | `src/components/admin/review/` (2 files) |
| Admin bookmarks | `src/components/admin/bookmarks/` (2 files) |
| Admin projects | `src/components/admin/projects/` (12 files) |
| Page components | `src/app/(admin)/learning/` + `src/app/(admin)/projects/` (11 files) |

TypeScript: **0 errors** (clean `tsc --noEmit`)
ESLint: **2 errors, 5 warnings**

---

## Critical Issues

None — no data exposure, no SQL injection vectors, no secrets hardcoded.

---

## High Priority

### H1 — `project-list-view.tsx`: Component defined inside render (ESLint error)

`SortHeader` is defined as a function component inside `ProjectListView`. React remounts it on every render, destroying state (though `SortHeader` is stateless, this is still bad practice and flagged as an ESLint error).

**Fix:** Move `SortHeader` outside `ProjectListView`.

```tsx
// Before (line 35, inside ProjectListView):
function SortHeader({ col, label }: { col: SortKey; label: string }) { ... }

// After: move above ProjectListView and accept handleSort + active via props,
// or hoist using useCallback ref — simplest is just moving it out with explicit props.
```

**File:** `src/components/admin/projects/project-list-view.tsx` — Rating: **6/10** (due to error)

---

### H2 — `note-list.tsx`: `setPage(1)` called synchronously inside `useEffect` (ESLint error)

Line 26 calls `setPage(1)` directly in the effect body before `startTransition`, causing a cascading render cycle.

**Fix:** Move `setPage(1)` into the `startTransition` callback body, or initialize page inside the transition after the fetch.

```tsx
// Before:
useEffect(() => {
  setPage(1)         // <-- synchronous setState in effect
  startTransition(async () => { ... })
}, [searchParams])

// After:
useEffect(() => {
  startTransition(async () => {
    const result = await getNotes(filters)
    setNotes(result.notes)
    setTotal(result.total)
    setPage(1)        // moved inside
  })
}, [searchParams])
```

**File:** `src/components/admin/notes/note-list.tsx` — Rating: **7/10** (due to error)

---

### H3 — `milestone-actions.ts`: Missing ownership check on `updateMilestone` and `deleteMilestone`

`updateMilestone` joins `projects!inner(user_id)` in the SELECT but does **not** filter `.eq('projects.user_id', user.id)` — the join is cosmetic, not a security guard. `deleteMilestone` fetches `project_id` but deletes `.eq('id', id)` with no user ownership enforcement. Any authenticated user can delete any milestone by ID.

```ts
// updateMilestone — add user ownership via joined filter:
.eq('id', id)
.eq('projects.user_id', user.id)   // <-- missing

// deleteMilestone — verify ownership before delete:
const { data: existing } = await supabase
  .from('project_milestones')
  .select('project_id, projects!inner(user_id)')
  .eq('id', id)
  .eq('projects.user_id', user.id)  // <-- add this
  .single()

if (!existing) return { error: 'Not found' }
```

**File:** `src/lib/actions/milestone-actions.ts` — Rating: **6/10**

---

### H4 — `storage-actions.ts`: `deleteProjectImage` accepts arbitrary storage path

`deleteProjectImage(path)` removes any path from the `project-images` bucket with no validation that the path belongs to the caller's project. An authenticated user could delete another user's images by guessing paths (format is `{projectId}/{timestamp}.{ext}`).

**Fix:** Validate that path starts with `{user.id}/` or verify the `projectId` segment belongs to `user.id` via a DB lookup before calling `.remove()`.

**File:** `src/lib/actions/storage-actions.ts` — Rating: **6/10**

---

## Medium Priority

### M1 — `bookmark-form.tsx` and `note-form.tsx`: `user_id` sent from client as empty string

Both forms set `user_id: ''` in the payload (line 43 `bookmark-form.tsx`, line 52 `note-form.tsx`). The server action correctly overwrites it with the authenticated user's ID, so there is no security risk. But the field is noise — `user_id` in client-side payloads is misleading and the `NoteInsert` / `BookmarkInsert` types expose this as a required field.

**Fix:** Omit `user_id` from client-side DTOs. Types should use `Omit<NoteInsert, 'user_id'>` for the form payload (matching how `project-actions.ts` already does it with `Omit<ProjectInsert, 'user_id'>`).

---

### M2 — `project-form.tsx`: Using `<img>` instead of Next.js `<Image>`

Line 210 uses `<img src={initialData.thumbnail_url} ...>` for the existing thumbnail preview. This skips Next.js image optimization and triggers a lint warning.

**Fix:** Replace with `import Image from 'next/image'` and provide explicit `width`/`height` or `fill` with a sized container.

---

### M3 — `project-form.tsx`: Unused expression in error handler (lint warning)

Line 104: `result.error ?? null` — the nullish coalescing returns a value but it's not used. This is from a destructuring pattern that got partially refactored.

```ts
// Before:
if (result.error) { setError(result.error ?? null); return }
// ?? null is pointless since result.error is already string | undefined
// After:
if (result.error) { setError(result.error); return }
```

---

### M4 — `note-card.tsx` / `note-detail.tsx`: Duplicated `TOPIC_COLORS` map

Both files define identical `TOPIC_COLORS` records. Extract to a shared constant (e.g., `src/lib/constants/note-topics.ts`).

---

### M5 — `projects/page.tsx`: Search filter runs client-side after server fetch

The page fetches all projects from DB (filtered by type/status/visibility) and then client-side filters by `search` in the page component. For small datasets this is fine, but differs from notes (which uses `ilike` server-side). Acceptable for now but document the inconsistency.

---

## Low Priority

### L1 — Unused imports (lint warnings)

- `note-filters.tsx`: `NoteTopicType` imported but unused
- `project-filters.tsx`: `ProjectStatusType`, `ProjectTypeType` imported but unused

**Fix:** Remove or use them.

### L2 — `spaced-repetition.ts`: `addDays` uses local machine time

`new Date()` is server-local time. For a single-user personal app this is acceptable, but for future multi-timezone support, `addDays` should accept a reference date or use UTC explicitly: `date.setUTCDate(date.getUTCDate() + days)`.

### L3 — `review-card.tsx`: All rating buttons show `...` while any rating is pending

When one button is clicked, all three show `...` (line 81: `{isPending ? '...' : label}`). Could show the label on non-clicked buttons. Minor UX.

### L4 — `milestone-list.tsx`: No confirmation before delete

`DeleteNoteButton` and `DeleteProjectButton` both call `confirm()` before destructive action. `MilestoneList.handleDelete` does not. Inconsistent pattern.

---

## Module Ratings

| File/Module | Rating | Notes |
|---|---|---|
| `spaced-repetition.ts` | 9/10 | Clean, correct SM-2 approximation. Level bounds correct (0-5). Minor: local time in addDays |
| `markdown-editor.tsx` | 9/10 | `rehypeSanitize` correctly applied. Toolbar logic clean. |
| `note-actions.ts` | 9/10 | Auth on every action, user_id scoped in all queries |
| `review-actions.ts` | 8/10 | `submitReview` checks auth but does not verify `scheduleId` ownership before fetch — low risk since update uses `.eq('user_id', user.id)` |
| `bookmark-actions.ts` | 8/10 | Auth correct. Silent error swallow on `getBookmarks` (returns [] on error) — acceptable for reads |
| `project-actions.ts` | 8/10 | Auth on all actions. `as Record<string, unknown>` cast is a workaround for Supabase join types — acceptable but worth noting |
| `milestone-actions.ts` | 6/10 | Missing ownership enforcement on update/delete (H3) |
| `storage-actions.ts` | 6/10 | File type + size validation good. Path ownership not validated (H4) |
| `activity-actions.ts` | 9/10 | Simple, correct. |
| `markdown-editor.tsx` (shared) | 9/10 | rehypeSanitize applied, no XSS risk |
| `note-form.tsx` | 8/10 | Clean. user_id pattern is misleading (M1) |
| `note-card.tsx` | 8/10 | Duplicate TOPIC_COLORS (M4) |
| `note-detail.tsx` | 8/10 | rehypeSanitize applied. Duplicate TOPIC_COLORS (M4) |
| `note-list.tsx` | 7/10 | ESLint error: setState in effect (H2) |
| `delete-note-button.tsx` | 9/10 | Clean confirm + toast pattern |
| `review-queue.tsx` | 9/10 | Simple state machine, correct index progression |
| `review-card.tsx` | 8/10 | rehypeSanitize applied. All buttons show pending state (L3) |
| `bookmark-form.tsx` | 8/10 | user_id: '' in payload (M1) |
| `bookmark-list.tsx` | 9/10 | Clean tab filtering, proper delete with optimistic update |
| `project-form.tsx` | 7/10 | `<img>` instead of `<Image>` (M2), unused expression (M3) |
| `project-kanban.tsx` | 9/10 | Clean grouping, no state needed, pure render |
| `project-list-view.tsx` | 6/10 | ESLint error: component in render (H1) |
| `project-detail-tabs.tsx` | 9/10 | Clean composition, no issues |
| `milestone-form.tsx` | 9/10 | Clean dialog form, FormData pattern consistent |
| `milestone-list.tsx` | 8/10 | No delete confirmation (L4) |
| `project-docs-editor.tsx` | 9/10 | Clean save pattern with feedback |
| `lessons-learned-editor.tsx` | 9/10 | Same pattern, consistent |
| Page components (8 files) | 9/10 | Clean RSC+client split, proper `notFound()` usage |

---

## Positive Observations

- Auth guard pattern (`if (!user) return { error: 'Unauthorized' }`) is applied consistently across all 7 action files.
- `rehypeSanitize` is used in all 3 markdown render sites (`review-card.tsx`, `note-detail.tsx`, `markdown-editor.tsx` preview). No XSS vectors found.
- No `any` types in hot paths — Supabase types are used throughout via `Database['public']['Tables']`.
- File sizes are well-managed: all files under 200 lines except `project-form.tsx` (237 lines — the embedded `ChipInput` component is the reason; acceptable or extract to separate file).
- Server actions use `.eq('user_id', user.id)` on all mutating DB operations, preventing IDOR for notes, bookmarks, and projects.
- TypeScript passes with zero errors.
- `storage-actions.ts` validates file type and size before upload — good defense in depth.

---

## Recommended Actions (Prioritized)

1. **Fix ESLint error:** Move `SortHeader` outside `ProjectListView` — `project-list-view.tsx`
2. **Fix ESLint error:** Move `setPage(1)` inside `startTransition` — `note-list.tsx`
3. **Security:** Add `.eq('projects.user_id', user.id)` filter to `updateMilestone` and `deleteMilestone` — `milestone-actions.ts`
4. **Security:** Validate storage path ownership in `deleteProjectImage` — `storage-actions.ts`
5. **Type cleanup:** Use `Omit<..., 'user_id'>` in note/bookmark form payloads — remove `user_id: ''`
6. **Lint cleanup:** Remove unused type imports in `note-filters.tsx` and `project-filters.tsx`
7. **DRY:** Extract `TOPIC_COLORS` to shared constant
8. **Next.js:** Replace `<img>` with `<Image>` in `project-form.tsx`

---

## Unresolved Questions

1. Does the Supabase `project_milestones` table have a Row-Level Security policy that enforces user ownership? If yes, H3 is mitigated at the DB level (but defense-in-depth in the action layer is still recommended).
2. Does the `project-images` storage bucket have RLS/policies preventing cross-user reads? If the bucket is public-read (required for thumbnail display), H4 path-guessing attack is real.
3. `review-actions.ts` `submitReview` — does the `review_schedule` table have RLS restricting select to `user_id = auth.uid()`? The action fetches `level` before checking ownership; if no RLS, any user could read another user's schedule level by guessing a UUID.
