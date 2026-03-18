---
title: "Phase 7 — Testing & Polish"
description: "Split oversized files, add input validation, error handling, fix N+1, add tests and Suspense"
status: pending
priority: P1
effort: 3-4 days
branch: master
tags: [testing, security, refactoring, performance]
created: 2026-03-18
---

# Phase 7 — Testing & Polish

Hardening pass: enforce dev rules (<200 lines), add input validation, consistent error handling, fix perf issues, and establish test infrastructure.

## Context Links

- [Plan overview](./plan.md)
- Scout report findings (N+1 in dashboard, 0 try-catch, no Zod, no tests)
- Dev rules: `docs/code-standards.md`, `docs/development-rules.md` (CLAUDE.md)

## Overview

| Priority | Task | Effort |
|----------|------|--------|
| P0 | Split oversized components | 2h |
| P0 | Zod validation on server action inputs | 3h |
| P0 | Try-catch error handling in all server actions | 2h |
| P0 | Fix N+1 dashboard query | 1h |
| P1 | Vitest unit tests for critical actions | 4h |
| P1 | Suspense boundaries on heavy pages | 1h |
| P2 | Playwright E2E for auth + CRUD | 4h |
| P2 | Rate limiting on auth | 1h |

## Requirements

**Functional**: All server actions validate inputs, return typed error objects, components under 200 lines.
**Non-functional**: Dashboard loads with single batch query per widget, test coverage on critical paths, Suspense for progressive loading.

## Related Code Files

### Files to Split (>200 lines)

| File | Lines | Split Strategy |
|------|-------|----------------|
| `components/admin/roadmap/roadmap-node-item.tsx` | 332 | Extract `StatusIcon`, `NodeActions` (move/delete buttons), `NodeContent` display into separate files |
| `components/admin/projects/project-form.tsx` | 238 | Extract `ChipInput` to `components/shared/chip-input.tsx`, extract form sections |
| `lib/actions/roadmap-actions.ts` | 325 | Split into `roadmap-query-actions.ts` (reads) + `roadmap-mutation-actions.ts` (writes) |

### Files to Modify

- All 11 files in `src/lib/actions/*.ts` — add Zod schemas + try-catch
- `src/lib/actions/dashboard-actions.ts` — batch N+1 in `getRecentActivity`
- Dashboard page + project detail page — add Suspense boundaries

### Files to Create

- `src/lib/validations/` — Zod schemas per entity (notes, projects, bookmarks, roadmap, etc.)
- `vitest.config.ts`, `src/__tests__/` — test infrastructure
- `playwright.config.ts`, `e2e/` — E2E infrastructure (P2)

## Implementation Steps

### Step 1: Split Oversized Components (P0)

1. **roadmap-node-item.tsx (332 lines)**
   - Extract `StatusIcon` to `roadmap-status-icon.tsx` (~25 lines)
   - Extract move/delete action buttons to `roadmap-node-actions.tsx` (~80 lines)
   - Extract child-add form toggle + inline form to keep main file as orchestrator
   - Target: main file ~150 lines

2. **project-form.tsx (238 lines)**
   - Extract `ChipInput` to `src/components/shared/chip-input.tsx` (~50 lines, reusable)
   - Extract image upload section to `project-image-upload.tsx` (~50 lines)
   - Target: main file ~140 lines

3. **roadmap-actions.ts (325 lines)**
   - Split into `roadmap-query-actions.ts` (getters) and `roadmap-mutation-actions.ts` (create/update/delete/reorder)
   - Update imports in consuming components
   - Target: each file ~160 lines

### Step 2: Zod Validation Schemas (P0)

4. Create `src/lib/validations/index.ts` as barrel export
5. Create schema files per domain:
   - `src/lib/validations/note-schemas.ts` — NoteInsert, NoteFilters
   - `src/lib/validations/project-schemas.ts` — ProjectInsert
   - `src/lib/validations/bookmark-schemas.ts` — BookmarkInsert
   - `src/lib/validations/roadmap-schemas.ts` — RoadmapInsert, NodeInsert
   - `src/lib/validations/review-schemas.ts` — ReviewAction
6. Install Zod: `npm install zod`
7. Apply `.parse()` at top of each mutation action (create/update/delete)
8. Return `{ error: string }` on validation failure — no throwing

### Step 3: Error Handling (P0)

9. Wrap every mutation action body in try-catch
10. Return consistent shape: `{ success: true }` or `{ error: string }`
11. Pattern (apply to all 11 action files):
    ```ts
    export async function createNote(input: NoteInsert) {
      const parsed = noteInsertSchema.safeParse(input)
      if (!parsed.success) return { error: parsed.error.issues[0].message }
      try {
        // ... existing logic
        return { success: true }
      } catch (e) {
        console.error('createNote failed:', e)
        return { error: 'Failed to create note' }
      }
    }
    ```
12. Update calling components to handle `{ error }` responses (toast already used in most)

### Step 4: Fix N+1 Dashboard Query (P0)

13. In `dashboard-actions.ts` `getRecentActivity()`: run the 3 title-resolution queries with `Promise.all()` instead of sequential awaits (lines 135-146)
14. In dashboard page: call `getReviewDueCount`, `getActiveProjects`, `getRecentActivity` with `Promise.all()` instead of 3 sequential awaits

### Step 5: Vitest Setup & Unit Tests (P1)

15. Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
16. Create `vitest.config.ts` with path aliases matching `tsconfig.json`
17. Write tests for critical server actions (mock Supabase client):
    - `src/__tests__/actions/note-actions.test.ts` — CRUD + validation rejection
    - `src/__tests__/actions/project-actions.test.ts` — CRUD + validation
    - `src/__tests__/actions/review-actions.test.ts` — review scoring logic
18. Target: ~15-20 test cases covering happy path + validation errors

### Step 6: Suspense Boundaries (P1)

19. Add `<Suspense fallback={<Skeleton />}>` wrappers on:
    - Dashboard page (wrap each widget independently)
    - Project detail page (wrap tabs content)
    - Note detail page (wrap markdown preview)
20. Create simple skeleton components if not already in shadcn setup
21. Convert data-fetching sections to async Server Components where needed

### Step 7: Playwright E2E (P2)

22. Install: `npm install -D @playwright/test`
23. Create `playwright.config.ts` with `webServer` pointing to `npm run dev`
24. Write E2E tests:
    - `e2e/auth.spec.ts` — login, logout, protected route redirect
    - `e2e/notes-crud.spec.ts` — create, edit, delete note
    - `e2e/projects-crud.spec.ts` — create, edit project
25. Target: 5-8 E2E scenarios

### Step 8: Rate Limiting (P2)

26. Add simple in-memory rate limiter middleware for auth routes
27. Use `Map<ip, { count, resetAt }>` pattern — no external deps
28. Apply to `/auth/callback` and login form action

## Todo List

- [ ] Split `roadmap-node-item.tsx` into 3 files
- [ ] Split `project-form.tsx` — extract ChipInput + image upload
- [ ] Split `roadmap-actions.ts` into query + mutation files
- [ ] Install Zod, create validation schemas
- [ ] Add Zod `.safeParse()` to all mutation actions
- [ ] Add try-catch to all server action mutations
- [ ] Return consistent `{ success } | { error }` from all mutations
- [ ] Fix N+1: `Promise.all()` in dashboard queries
- [ ] Install Vitest + Testing Library
- [ ] Write unit tests for note/project/review actions
- [ ] Add Suspense boundaries to dashboard + detail pages
- [ ] (P2) Install Playwright, write auth + CRUD E2E tests
- [ ] (P2) Add rate limiting to auth routes
- [ ] Verify build passes with 0 TS errors after all changes

## Success Criteria

- All code files <200 lines
- All mutation actions validate inputs with Zod
- All mutation actions wrapped in try-catch with typed returns
- Dashboard N+1 resolved (title queries run in parallel)
- Vitest runs with >15 passing tests on critical actions
- Build clean: 0 TS errors, 0 lint warnings
- Suspense boundaries on dashboard + detail pages

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Component split breaks props/state flow | Medium | Test each split component in browser immediately |
| Zod validation too strict rejects valid input | Medium | Match schemas to existing TypeScript types exactly |
| Server action return type changes break UI | High | Search all callers before changing return shape; update toast handling |
| Supabase mocking in Vitest is fragile | Low | Mock at module level, keep mocks minimal |

## Security Considerations

- Zod validation prevents injection via malformed inputs to server actions
- Try-catch prevents error stack leaks to client
- Rate limiting mitigates brute-force on auth (P2)
- No new auth surface — existing RLS + middleware unchanged
