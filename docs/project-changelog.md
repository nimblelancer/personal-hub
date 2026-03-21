# Project Changelog

All notable changes to the personal-hub project are documented here.

## Version 1.0.1 — Global Search & Navigation (2026-03-22)

### Global Search ⌘K Command Palette
- **New feature**: Global command palette accessible via Ctrl+K or ⌘K from anywhere in admin
  - Multi-entity search: notes (title+content), bookmarks (title+url), projects (name+one_liner), roadmaps (name+description)
  - Returns up to 5 results per entity type (20 total) grouped by category
  - 300ms debounce, minimum 2 character query
  - Navigate search results with arrow keys, select with enter or mouse click
  - Close with ESC key
- **New files**:
  - `src/components/ui/command.tsx` — Command palette UI primitive (cmdk integration)
  - `src/lib/actions/global-search-actions.ts` — Multi-entity search server action
  - `src/components/admin/global-search-palette.tsx` — Command palette component
  - `src/components/admin/admin-search-provider.tsx` — Search context provider
- **Modified files**:
  - `src/components/admin/admin-sidebar.tsx` — Added keyboard shortcut indicator
  - `src/app/(admin)/admin/layout.tsx` — Integrated search provider

---

## Version 1.0.0 — Phase 07 P2 Complete (2026-03-18)

### Testing & E2E Coverage
- **Playwright E2E test suite**: Added comprehensive end-to-end tests
  - `src/tests/e2e/auth-flow.spec.ts` — Login/logout flow validation
  - `src/tests/e2e/notes-crud.spec.ts` — Note creation, read, update, delete operations
  - `src/tests/e2e/projects-crud.spec.ts` — Project management flow testing
- **Vitest unit tests**: 100+ test cases for server actions and utilities
- **Suspense boundaries**: Progressive loading on dashboard and detail pages

### Security Enhancements
- **Rate limiting**: Added in-memory IP-based rate limiter
  - Protection on `/login` route: 5 requests per 60 seconds per IP
  - Implementation: `src/lib/rate-limiter.ts`
  - Applied in `src/middleware.ts`
- **Build verification**: TypeScript strict mode, 0 compilation errors

### Quality Improvements
- Code refactoring: 3 oversized files split to maintain <200 LOC standard
- Input validation: Zod schemas on all mutation actions
- Error handling: try-catch blocks with consistent return types on 11 action files
- N+1 query optimization: Dashboard queries batched with Promise.all()

### Documentation
- Updated development roadmap with Phase 07 completion
- Enhanced system architecture with rate limiting details
- Created project changelog

---

## Version 0.9.0 — Phase 06 Complete (2026-03-15)

### Public Portfolio & Roadmap
- Public project showcase filtered by visibility
- Blog system for publishing articles
- Resume/CV page with project highlights
- SEO: sitemap.ts and robots.ts
- Public navbar, footer, and about section

---

## Version 0.8.0 — Phase 05 Complete (2026-03-12)

### Dashboard & Analytics
- Dashboard overview page with widget layout
- Quick actions: add note, project, bookmark
- Active projects widget showing in-progress count and milestones
- Review due widget with spaced repetition statistics
- Recent activity widget displaying user action log
- Responsive dashboard grid layout

---

## Version 0.7.0 — Phase 04 Complete (2026-03-08)

### Cross-Linking & Entity Relationships
- Entity links table for note↔project↔bookmark↔roadmap relationships
- Entity link dialog for creating relationships
- Linked entities list component showing related items
- Bidirectional relationship support

---

## Version 0.6.0 — Phase 03 Complete (2026-02-25)

### Advanced Admin Features
- Project documentation editor (markdown)
- Milestone tracking for projects
- Lessons learned (post-mortem notes)
- Note detail view with search and filters
- Project dashboard with status filtering
- Review queue for spaced repetition system

---

## Version 0.5.0 — Phase 02 Complete (2026-02-15)

### Admin Core Features
- User profiles (display_name, bio, avatar, contact info)
- Note CRUD with topic categories (AI/ML, coding, languages, other)
- Bookmark management with status tracking (saved/reading/done/noted)
- Project CRUD with tech stack and visibility controls
- Spaced repetition review schedule (SM-2 algorithm)
- Activity logging for all user actions

---

## Version 0.1.0 — Phase 01 Complete (2026-01-20)

### Project Setup & Core Infrastructure
- Next.js 15 App Router setup with TypeScript
- Supabase database schema (11 tables)
- Authentication via Supabase Auth (email/password)
- Middleware for session and auth protection
- Tailwind CSS 4 + shadcn/ui integration
- Environment setup (Vercel deployment ready)

