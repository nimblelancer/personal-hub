# Code Review: Phase 01 - Project Setup

**Date:** 2026-03-17
**Scope:** Supabase clients, auth middleware, layouts, login page
**Files reviewed:** 10 files, ~460 LOC total
**TypeScript:** `strict: true` enabled, `tsc --noEmit` passes clean

---

## Overall Assessment

Solid, idiomatic Next.js + Supabase SSR setup. Follows official Supabase SSR patterns correctly. No critical security issues. Minor improvements possible around error handling and route coverage.

---

## Category Scores

| Category | Score | Notes |
|---|---|---|
| Security | 8/10 | No service role key exposure; anon key only; silent catch is minor concern |
| TypeScript | 9/10 | Strict mode, fully typed with `Database` generic, no `any` |
| Auth Flow | 8/10 | Middleware protection correct but route list is manually maintained |
| Code Quality (YAGNI/KISS/DRY) | 9/10 | Clean, minimal, no bloat |
| File Size | 10/10 | All files well under 200 lines |

**Total: 8.8 / 10**

---

## Issues

### Medium Priority

**1. Silent empty catch in `server.ts` cookie setter**
File: `src/lib/supabase/server.ts` line 18
```ts
} catch {}
```
The empty catch swallows errors silently. This is the Supabase-recommended pattern for Server Components (cookies can't be set after streaming starts), but with no comment explaining why, it looks like a bug. Add a brief comment.

**2. Hardcoded protected-route list in middleware**
File: `src/lib/supabase/middleware.ts` lines 28–30
```ts
const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
  request.nextUrl.pathname.startsWith('/learning') ||
  request.nextUrl.pathname.startsWith('/projects')
```
As routes grow, this list becomes a maintenance burden and easy to forget. Consider a single prefix approach (e.g., all admin routes under `/app/` or `/admin/`) or extract the list to a constant so it's one place to update.

**3. `setLoading(false)` not called on successful sign-in**
File: `src/app/(auth)/login/page.tsx` line 32–33
```ts
router.push('/dashboard')
router.refresh()
```
If navigation is slow, the spinner stays active indefinitely (no finally block). Cosmetic but noticeable.

### Low Priority

**4. `/projects` is both a public nav link and a protected admin route**
`PublicLayout` links to `/projects` (public navbar). Middleware protects `/projects` and redirects unauthenticated users to `/login`. This will confuse public visitors. Either remove the public link, make `/projects` public-readable, or use a different admin-only path.

**5. `key={idx}` on stable nav sections**
File: `src/components/admin/admin-sidebar-nav.tsx` line 74
Using array index as key is fine here (static data, never reordered), but `key={section.title ?? 'main'}` would be semantically cleaner.

**6. `new Date().getFullYear()` in server component renders at build time in static export**
File: `src/app/(public)/layout.tsx` line 31
If the site is statically exported, the copyright year would be frozen at build time. No impact for SSR deployments.

---

## Positive Observations

- `supabase.auth.getUser()` used in middleware (correct — validates JWT server-side vs. the insecure `getSession()`)
- No service role key anywhere in client-facing code
- `Database` generic applied consistently to all three clients
- Middleware matcher correctly excludes static assets
- Responsive sidebar pattern (Sheet on mobile, fixed aside on desktop) is clean
- `autoComplete` attributes on login inputs — good UX and accessibility
- `aria-label` on hamburger button
- `SheetHeader` with `sr-only` for screen readers on mobile drawer

---

## Unresolved Questions

1. Is `/projects` intentionally public-readable or admin-only? The route collision (public nav link + middleware protection) needs a decision.
2. Will a `SUPABASE_SERVICE_ROLE_KEY` ever be needed (e.g., admin operations)? If yes, a separate `createAdminClient()` in `server.ts` should be planned for server-only use — ensure it never touches the browser client file.
