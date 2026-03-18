# Phase 07 Testing & Polish — Scout Report

**Date:** 2026-03-18 | **Status:** Initial Assessment | **Codebase:** Personal Hub

---

## 1. Existing Test Setup

**NO TEST INFRASTRUCTURE FOUND**

- No jest.config, vitest.config, or playwright.config files
- No test files in project (checked `__tests__/`, `*.test.*`, `*.spec.*`)
- **package.json test script:** NOT DEFINED (only `dev`, `build`, `start`, `lint`)
- **Test dependencies:** ZERO — no jest, vitest, playwright, mocha, or testing-library
- ESLint config uses Next.js core-web-vitals + typescript presets only

**Impact:** Tests must be implemented from scratch. Recommend Vitest (fast, ESM-native) + React Testing Library for UI.

---

## 2. Critical Server Actions — Complete Inventory

**Location:** `/src/lib/actions/` (11 files, 1,373 lines total)

| File | Lines | Key Exports |
|------|-------|------------|
| roadmap-actions.ts | 325 | getRoadmaps, getRoadmap, createRoadmap, updateRoadmap, deleteRoadmap, createRoadmapNode, updateRoadmapNode, deleteRoadmapNode |
| entity-link-actions.ts | 178 | linkEntities, unlinkEntities, getLinkedEntities, getLinksFor |
| project-actions.ts | 166 | getProjects, getProject, createProject, updateProject, updateProjectStatus, deleteProject, updateProjectDoc, updateLessonsLearned |
| dashboard-actions.ts | 156 | getReviewDueCount, getReviewDuePreview, getActiveProjects, getRecentActivity |
| note-actions.ts | 128 | getNotes, getNote, createNote, updateNote, deleteNote |
| milestone-actions.ts | 96 | createMilestone, updateMilestone, deleteMilestone |
| bookmark-actions.ts | 93 | getBookmarks, createBookmark, updateBookmark, deleteBookmark |
| review-actions.ts | 76 | getReviewQueue, submitReview |
| profile-actions.ts | 69 | getPublicProfile, getPublicProjects, getPublicNotes, updateProfile |
| storage-actions.ts | 68 | uploadToStorage, deleteFromStorage, getStorageUrl |
| activity-actions.ts | 18 | logActivity |

**Total Action Functions:** ~50+ exports across 11 files

---

## 3. Auth Flows & Security

### Auth Architecture

```
Middleware (src/middleware.ts)
  → updateSession() [src/lib/supabase/middleware.ts]
    → Supabase Auth + SSR Cookies
    → Admin route protection (/admin/*)
    → Redirect to /login if unauthorized
```

### Login Flow

**File:** `src/app/(auth)/login/page.tsx` (90 lines)

- Client component with email/password form
- Uses Supabase client auth (`signInWithPassword`)
- Toast notifications (sonner)
- Redirects to `/admin/dashboard` on success
- **Issue:** No input validation, rate limiting, or CSRF protection visible

### Auth Checks in Server Actions

**Pattern:** All mutating actions check auth before DB operations

```typescript
// Standard pattern in 50+ functions:
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { error: 'Unauthorized' }
```

**Coverage:** ✓ Profile actions, ✓ Project/Note/Bookmark CRUD, ✓ Review ops
**Gap:** Public read actions don't verify RLS (trusting Supabase RLS policies)

### RLS Implementation

- **Comment found:** `// Public — no auth required (anon key + RLS allows reading profiles)`
- **No explicit RLS validation** in code — relies on Supabase policies
- **Risk:** If RLS policies misconfigured, unauthorized reads possible
- **DB Rows Include user_id filters** but limited column-level filtering in queries

---

## 4. Security Concerns

### High Priority

1. **No Input Validation**
   - All server action inputs accepted directly without schema validation
   - SQL injection risk: SEARCH/FILTER queries use `.ilike.%...%` without sanitization
   - **Example:** `note-actions.ts:25` — `query.or(\`title.ilike.%${filters.search}%\`)`

2. **Missing Error Boundary Try-Catch**
   - Only 2 try-catch blocks in entire actions folder
   - `note-actions.ts:38` throws raw error: `if (error) throw new Error(error.message)`
   - Other actions silently return empty arrays on error: `if (error) return []`
   - **Risk:** Inconsistent error handling, potential info leaks

3. **No Rate Limiting**
   - Login endpoint has no rate limit
   - Server actions can be called repeatedly without throttling
   - **Risk:** Brute force login, DOS on mutations

4. **Implicit Trust in RLS**
   - No server-side role/permission validation beyond auth check
   - Assumes Supabase RLS policies are configured correctly
   - **Risk:** Over-permissive RLS = data leaks

### Medium Priority

5. **Weak Return Type Pattern**
   - Inconsistent error responses: `{ error?: string }` OR empty array `[]` OR `null`
   - Client can't distinguish "user not auth" from "resource not found"
   - **Example:** `project-actions.ts` returns `null` on error; `profile-actions.ts` returns `{}`

6. **Public Profile/Projects Expose User Data**
   - `getPublicProfile()` / `getPublicNotes()` assume visibility flags are set correctly
   - No column filtering — returns all fields marked "public"
   - **Risk:** If visibility column misconfigured, private data leaks

7. **Timestamp Overwriting**
   - All updates pass `updated_at: new Date().toISOString()` manually
   - If DB trigger exists, could cause conflicts
   - **Best practice:** Let DB handle timestamps via triggers

8. **Middleware Deprecation**
   - Build warning: `"middleware" file convention is deprecated. Please use "proxy" instead.`
   - Should migrate `src/middleware.ts` to new Next.js proxy API

---

## 5. Performance Analysis

### Large Components (Candidates for Splitting)

| Component | Lines | Issue |
|-----------|-------|-------|
| roadmap-node-item.tsx | 332 | **Over-complex** — likely needs extraction |
| project-form.tsx | 238 | Form logic + validation + submission |
| roadmap-node-form.tsx | 172 | Complex form with nested state |
| entity-link-dialog.tsx | 141 | Modal logic + form + search |
| profile-form.tsx | 136 | Multi-field form |

**Recommendation:** Split into sub-components (Form → Fields → Actions)

### Missing Performance Optimizations

1. **NO Suspense Boundaries** — 0 instances found in codebase
   - All pages render synchronously
   - **Risk:** Large data fetches block entire page render

2. **NO Dynamic Imports** — only 2 instances of `export const dynamic = 'force-dynamic'`
   - Used in blog/projects detail pages
   - **Gap:** Admin pages with heavy computation should use ISR or incremental builds

3. **N+1 Query Pattern in dashboard-actions.ts**
   - Lines 128-146: Fetches activity log, then resolves titles in separate queries
   - `getRecentActivity()` does 4 separate Supabase queries (activity + notes + projects + bookmarks)
   - **Impact:** ~500ms latency if batch sizes large; should batch all IDs upfront

4. **Large Detail Pages**
   - `/admin/projects/[id]` = 74 lines (fetches project + docs + milestones + lessons_learned)
   - No loading skeleton or streaming

### Positive Patterns

- ✓ `roadmap-actions.ts:27-32` — Uses single multi-fetch for nodes (good optimization)
- ✓ `revalidatePath()` used consistently for cache invalidation
- ✓ Server actions centralized (no duplicated DB logic in components)

---

## 6. Build Output & TypeScript

### Build Status
✓ **SUCCESS** — 0 errors

```
✓ Compiled successfully in 12.2s
✓ Running TypeScript ... [passed]
✓ Generating static pages (21/21) in 723.9ms
```

### TypeScript Config
- **Target:** ES2017
- **Mode:** strict
- **Module Resolution:** bundler (Next.js 16)
- **Path Alias:** `@/*` → `./src/*`

### Build Warnings
1. **Middleware Deprecation** (non-breaking)
   - `"middleware" convention deprecated → use "proxy"`
   - No action needed yet; Next.js will support both for versions

### Static Route Analysis
- 21 pre-rendered routes identified
- 11 dynamic routes requiring server render (admin pages)
- 2 "force-dynamic" routes (blog detail, projects detail)

### Lint Output
✓ **No errors** — ESLint runs without warnings

---

## 7. Package.json — Test & Dev Dependencies

### Current Test Deps
**NONE** — no testing framework installed

### Current Build Deps
```json
{
  "dependencies": {
    "next": "16.1.7",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@supabase/ssr": "^0.9.0",
    "@supabase/supabase-js": "^2.99.2",
    "sonner": "^2.0.7",
    "react-markdown": "^10.1.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "eslint": "^9",
    "eslint-config-next": "16.1.7",
    "tailwindcss": "^4"
  }
}
```

### Test Framework Recommendations
- **Unit/Integration:** Vitest (ESM, fast, React 19 compatible)
- **Component:** React Testing Library (already common pattern)
- **E2E:** Playwright (supports Next.js, auth flows)
- **Setup:** ~5 new deps + config files

---

## Unresolved Questions

1. **Database RLS Policies** — Are they configured in Supabase? Need verification.
2. **Rate Limiting Backend** — Is it handled by Supabase Auth or should be added?
3. **Error Logging** — Where are server action errors logged? (No Sentry/logging visible)
4. **Visibility Cascade** — If project visibility='public', are all child notes also public?
5. **Storage Cleanup** — On delete, are storage objects also removed? (storage-actions.ts unclear)
6. **Concurrent Updates** — Do milestone/project mutations handle optimistic UI or pessimistic?

---

## Summary for Phase 07

**Test Coverage Needed:**
- Unit tests: 50+ server actions (auth, CRUD, business logic)
- Integration tests: Supabase interactions + RLS enforcement
- Component tests: Forms (project, note, bookmark), dialogs
- E2E tests: Login → dashboard → create note → review flow

**Polish Needed:**
- Input validation layer (Zod schema for all action inputs)
- Consistent error handling & return types
- Rate limiting on login/mutations
- Suspense + skeleton loading
- Component refactoring (3-4 components > 200 lines)
- Migrate middleware to Next.js proxy API

**Risk Level:** MEDIUM — No tests + input validation gaps, but RLS + auth checks present
