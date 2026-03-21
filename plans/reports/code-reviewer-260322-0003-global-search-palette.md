# Code Review: Global Search ⌘K Command Palette

**Branch:** `feat/ui-modernization-emerald-theme`
**Date:** 2026-03-22
**Reviewer:** code-reviewer agent

---

## Scope

- **Files reviewed:** 6
- **LOC:** ~300
- **Focus:** Security, TypeScript correctness, Supabase ILIKE queries, React patterns, Accessibility

### Files

| File | Status |
|------|--------|
| `src/components/ui/command.tsx` | New |
| `src/lib/actions/global-search-actions.ts` | New |
| `src/components/admin/global-search-palette.tsx` | New |
| `src/components/admin/admin-search-provider.tsx` | New |
| `src/components/admin/admin-sidebar.tsx` | Modified |
| `src/app/(admin)/admin/layout.tsx` | Modified |

---

## Overall Assessment

Solid, well-structured implementation. Auth guard is present. RLS is enabled on all queried tables. React patterns are clean. The main actionable issues are: a ILIKE injection vector via the `.or()` string pattern, stale-closure loading state, and minor a11y gaps.

---

## Critical Issues

### 1. ILIKE Pattern Injection via `.or()` String Interpolation

**File:** `src/lib/actions/global-search-actions.ts`, lines 21–47

**Problem:** The pattern variable is interpolated directly into the `.or()` filter string:

```ts
const pat = `%${query}%`
// ...
.or(`title.ilike.${pat},content.ilike.${pat}`)
```

The PostgREST `.or()` method takes a raw filter expression string. A crafted query containing `.`, `,`, or PostgREST filter syntax characters (e.g., `%foo,id.eq.other-user-uuid`) can potentially escape the ILIKE clause and inject additional OR conditions, which could bypass the `user_id` row filter that Supabase applies *after* the query is constructed on the client side. RLS is the final backstop here, but defense-in-depth requires sanitizing at the action layer too.

**Compare with existing safe usage in** `bookmark-actions.ts` line 27: that one also uses interpolation, so this is a systemic pattern issue — but worth fixing here.

**Fix:** Use the typed `.ilike()` chained calls instead of `.or()`:

```ts
// Instead of .or(string):
supabase
  .from('notes')
  .select('id, title, topic')
  .eq('user_id', uid)
  .ilike('title', pat)  // Only searches title; can't multi-field this way

// For multi-field: strip special PostgREST chars before interpolating
const safe = query.replace(/[%_,.()']/g, '')  // or use pg_catalog.quote_literal equivalent
const pat = `%${safe}%`
```

Or minimally, strip PostgREST special chars from `query` before constructing `pat`:

```ts
const sanitized = query.replace(/[,().]/g, '')
const pat = `%${sanitized}%`
```

**Severity:** High — RLS is the safety net, but the action layer should not be bypassable even partially.

---

## High Priority

### 2. Loading State Race Condition (Stale Closure)

**File:** `src/components/admin/global-search-palette.tsx`, lines 44–56

**Problem:** If the user types quickly, multiple debounce timers fire. Only the last `setTimeout` callback is run (correct), BUT `setLoading(false)` inside the timeout could still race with a new query that set loading back to `true`. More critically: if a slow response from a previous query resolves *after* a new query has started, `setResults(items)` will overwrite newer results with stale ones.

```ts
const timer = setTimeout(async () => {
  const items = await globalSearch(query)  // stale if query changed
  setResults(items)
  setLoading(false)
}, 300)
return () => clearTimeout(timer)
```

The `clearTimeout` only cancels the *timer* — it does not cancel the in-flight `globalSearch` fetch if it already fired.

**Fix:** Add an `isCancelled` guard:

```ts
useEffect(() => {
  if (query.length < 2) { setResults([]); return }
  setLoading(true)
  let cancelled = false
  const timer = setTimeout(async () => {
    const items = await globalSearch(query)
    if (!cancelled) {
      setResults(items)
      setLoading(false)
    }
  }, 300)
  return () => {
    cancelled = true
    clearTimeout(timer)
  }
}, [query])
```

**Severity:** High — visible UX bug under fast typing / slow network.

### 3. No Error Handling on `globalSearch` Call

**File:** `src/components/admin/global-search-palette.tsx`, line 51

**Problem:** If the server action throws (network error, Supabase timeout, etc.), the palette silently stays in loading state forever — `setLoading(false)` is never called.

```ts
const items = await globalSearch(query)
setResults(items)
setLoading(false)
```

**Fix:**

```ts
try {
  const items = await globalSearch(query)
  if (!cancelled) { setResults(items); setLoading(false) }
} catch {
  if (!cancelled) { setResults([]); setLoading(false) }
}
```

**Severity:** High — permanent spinner on any server error.

### 4. No Error Handling on Supabase Queries (Server Action)

**File:** `src/lib/actions/global-search-actions.ts`, lines 23–48

**Problem:** All four Supabase query results are used via `?? []` on `.data`, but `.error` is never checked. A failed query (permissions error, missing column, network issue) silently returns empty — acceptable for search UX, but errors should at minimum be logged server-side.

```ts
// Current: silently ignores errors
for (const note of notesRes.data ?? []) { ... }
```

**Fix:** Add server-side error logging:

```ts
if (notesRes.error) console.error('[globalSearch] notes:', notesRes.error.message)
```

**Severity:** High for observability, Low for UX.

---

## Medium Priority

### 5. `TYPE_ICONS` Defined at Module Level with JSX

**File:** `src/components/admin/global-search-palette.tsx`, lines 23–28

**Problem:** JSX elements are created once at module init time and shared across all renders. This is technically fine for static icons, but it means the same React element instances are reused — which can cause issues if React ever tries to reconcile them as belonging to different trees.

**Fix:** Use a function or `useMemo`, or define as a mapping of components, not JSX elements:

```ts
const TYPE_ICONS: Record<SearchResultItem['type'], React.ComponentType<{ className?: string }>> = {
  note: BookOpen,
  bookmark: Bookmark,
  // ...
}
// Usage: <TypeIcon className="h-4 w-4 text-emerald-500" />
```

This also avoids hardcoding the className in the map.

**Severity:** Medium — currently works, but not idiomatic.

### 6. `openSearch` Function Recreated on Every Render

**File:** `src/components/admin/admin-search-provider.tsx`, line 32

```ts
<SearchContext.Provider value={{ openSearch: () => setOpen(true) }}>
```

A new object and function are created each render, triggering context consumers to re-render unnecessarily.

**Fix:**

```ts
const openSearch = useCallback(() => setOpen(true), [])
const value = useMemo(() => ({ openSearch }), [openSearch])
// ...
<SearchContext.Provider value={value}>
```

**Severity:** Medium — minor perf overhead, negligible in this app's scale.

### 7. Keyboard Shortcut Shows `⌘K` on Windows/Linux

**File:** `src/components/admin/admin-sidebar.tsx`, line 35

```tsx
<kbd ...>⌘K</kbd>
```

The shortcut handler correctly listens for both `metaKey` (Mac) and `ctrlKey` (Windows/Linux), but the badge always shows `⌘K`. On Windows/Linux users see `⌘K` but must press `Ctrl+K`.

**Fix:**

```tsx
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
// Then in JSX:
<kbd ...>{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
```

Or use a `useEffect` to detect platform after hydration to avoid SSR mismatch.

**Severity:** Medium — UX confusion for non-Mac users.

---

## Low Priority

### 8. `CommandEmpty` Used for "Type to search" Hint

**File:** `src/components/admin/global-search-palette.tsx`, lines 99–101

`CommandEmpty` is semantically for "no results" state. Using it for the initial prompt hint (`Type 2+ characters to search`) is a misuse — screen readers may announce it as "no results" prematurely.

**Fix:** Use a plain `div` with `role="status"` for the hint:

```tsx
{!loading && query.length < 2 && (
  <div className="py-6 text-center text-sm text-muted-foreground" role="status">
    Type 2+ characters to search
  </div>
)}
```

**Severity:** Low — a11y nitpick.

### 9. `value` Prop Collision Risk on `CommandItem`

**File:** `src/components/admin/global-search-palette.tsx`, line 107

```tsx
value={`${item.type}-${item.id}-${item.title}`}
```

`cmdk` uses `value` for internal filtering/highlighting. Since search results are already filtered server-side, and `shouldFilter` is not set to `false`, cmdk will re-filter results against the query string client-side. This means results could disappear from the list if the title/type/id don't match the query string.

**Fix:** Disable cmdk's internal filter since search is done server-side:

```tsx
<Command shouldFilter={false}>
```

Pass this through `CommandDialog` → `Command`.

**Severity:** Low-Medium — could cause results to vanish unexpectedly for some query strings.

---

## Edge Cases Found by Scout

- **Fast typing + slow network:** Addressed in issue #2 — stale results from prior slow response can overwrite current results.
- **Query with `%` or `_` wildcards:** User typing `%test%` produces `%%test%%` in the ILIKE pattern. Functionally matches everything containing `test`, not a security issue, but semantically unexpected. Sanitizing resolves both this and issue #1.
- **Query with PostgREST special chars (`,`, `(`, `)`): Addressed in issue #1.
- **Empty string edge case:** Correctly guarded by `query.length < 2` check on both client and server.
- **Authenticated but missing profile row:** No profile dependency in search action — not affected.
- **Table doesn't exist in DB:** Silent empty result (no error surfaced). Issue #4 covers this.
- **SSR hydration for keyboard shortcut badge:** `navigator.platform` not available on server — issue #7 touches this. The current `⌘K` string is safe (no SSR mismatch), but the fix for #7 must account for hydration.

---

## Positive Observations

- Auth guard present: `getUser()` check at line 17, returns `[]` for unauthenticated — correct.
- RLS is enabled on all 4 queried tables (`notes`, `bookmarks`, `projects`, `roadmaps`) with `user_id` policies — double layer of protection even if action auth is bypassed.
- Debouncing is implemented (300ms) — avoids hammering the DB on every keystroke.
- Reset on close (`useEffect` on `open`) — clean state management.
- `useCallback` on `handleSelect` — avoids unnecessary re-renders.
- `DialogTitle` with `sr-only` class — screen readers get a label for the modal.
- Grouped results with section headings — good UX pattern.
- `aria-label="Open search"` on trigger button and `aria-label="Open navigation"` on hamburger — correct.
- Mobile sheet with `SheetHeader sr-only` — accessibility-correct.
- `cmdk` `CommandDialog` wraps Radix `Dialog` — inherits focus trap and `Esc` to close.
- File sizes all under 200 lines — compliant with project modularization rules.

---

## Recommended Actions (Prioritized)

1. **[High] Fix ILIKE injection** — sanitize `query` before constructing the `.or()` pattern string (strip `,`, `.`, `(`, `)` at minimum).
2. **[High] Add stale-closure guard + error handling** in `global-search-palette.tsx` `useEffect` — `cancelled` flag + try/catch.
3. **[High] Add server-side error logging** in `global-search-actions.ts` for each Supabase query error.
4. **[Medium] Disable cmdk internal filtering** — add `shouldFilter={false}` to `Command` component since results are server-filtered.
5. **[Medium] Fix platform shortcut hint** — show `Ctrl+K` on non-Mac, `⌘K` on Mac.
6. **[Low] Fix `openSearch` stability** — wrap in `useCallback` + `useMemo` in `AdminSearchProvider`.
7. **[Low] Replace `CommandEmpty` for hint** — use `div[role=status]` for the "Type 2+ characters" prompt.

---

## Metrics

- TypeScript errors: 0 (build passes per task spec)
- Linting issues: None observed (no linter output available)
- Test coverage: N/A (no tests for these components)
- RLS coverage: 4/4 queried tables have RLS + user_id policies

---

## Unresolved Questions

1. Does the project have GIN or full-text indexes on `notes.content` and `bookmarks.url`? ILIKE on unindexed text columns does a full sequential scan — could be slow with large datasets. The schema file shows `idx_notes_user` and `idx_bookmarks_user` (on `user_id`) but no text search indexes.
2. Is `one_liner` on `projects` guaranteed to exist in the DB schema for all rows (nullable column is fine, but is the column present)? Confirmed present in schema at line 69.
3. Should the search palette be accessible from keyboard only (no mouse trigger in mobile sheet) — the current mobile UX requires tapping the search bar in the sheet, which is correct but worth confirming with design intent.
