# System Architecture

## Route Groups & Implementation

### Public Routes `(public)`
Unauthenticated users can access marketing, portfolio, and content pages.

| Route | Purpose | Component |
|-------|---------|-----------|
| `GET /` | Landing page with CTA to login | Root page.tsx |
| `GET /projects` | Project showcase (public visibility) | projects/page.tsx |
| `GET /projects/[id]` | Project detail view | projects/[id]/page.tsx |
| `GET /blog` | Blog post listing | blog/page.tsx |
| `GET /blog/[id]` | Blog post reader | blog/[id]/page.tsx |
| `GET /resume` | Resume/CV | resume/page.tsx |

**Public Components** (`src/components/public/`):
- `public-navbar.tsx` — Navigation header
- `public-footer.tsx` — Footer section
- `about-section.tsx` — About/intro block
- `project-showcase-grid.tsx` — Projects listing
- `project-showcase-card.tsx` — Individual project preview
- `project-detail-view.tsx` — Full project details
- `blog-post-list.tsx` — Articles listing
- `blog-post-card.tsx` — Article preview
- `blog-post-content.tsx` — Article reader
- `resume-content.tsx` — Resume display

### Auth Routes `(auth)`
Authentication flows and session management.

| Route | Purpose |
|-------|---------|
| `GET /login` | Authentication form |
| `POST /auth/login` | Credential submission (Supabase Auth) |
| `GET /auth/callback` | OAuth redirect handler |

### Admin Routes `(admin)`
Protected by middleware. Redirects unauthenticated users to `/login`.

| Base Route | Sub-routes | Purpose |
|-----------|-----------|---------|
| `/admin/dashboard` | N/A | Overview, widgets, quick stats |
| `/admin/learning/notes` | `/new`, `/[id]`, `/[id]/edit` | Note CRUD & spaced repetition |
| `/admin/learning/bookmarks` | `/new` | Bookmark management |
| `/admin/learning/review` | N/A | Review queue (spaced repetition) |
| `/admin/learning/roadmap` | `/new`, `/[id]` | Learning path management |
| `/admin/projects` | `/new`, `/[id]`, `/[id]/edit` | Project CRUD, milestones, docs |
| `/admin/settings` | N/A | Profile & user settings |

**Admin Components** (`src/components/admin/`):
- `admin-sidebar.tsx` — Navigation sidebar
- `admin-sidebar-nav.tsx` — Sidebar menu items

**Dashboard Widgets** (`src/components/admin/dashboard/`):
- `dashboard-grid.tsx` — Layout container
- `quick-actions-widget.tsx` — Add note/project/bookmark buttons
- `active-projects-widget.tsx` — In-progress projects summary
- `review-due-widget.tsx` — Spaced repetition stats
- `recent-activity-widget.tsx` — User action log

**Note Components** (`src/components/admin/notes/`):
- `note-form.tsx` — Create/edit form
- `note-list.tsx` — List with filtering
- `note-card.tsx` — Preview card
- `note-detail.tsx` — Full content viewer
- `note-filters.tsx` — Topic/status filters
- `delete-note-button.tsx` — Deletion handler

**Project Components** (`src/components/admin/projects/`):
- `project-form.tsx` — Create/edit form
- `project-list-view.tsx` — Table/list view
- `project-kanban.tsx` — Kanban board (by status)
- `project-card.tsx` — Preview card
- `project-overview.tsx` — Project summary
- `project-detail-tabs.tsx` — Docs/milestones/links tabs
- `project-docs-editor.tsx` — Markdown editor
- `milestone-form.tsx` — Milestone CRUD
- `milestone-list.tsx` — Milestone list
- `lessons-learned-editor.tsx` — Post-mortem notes
- `project-filters.tsx` — Status/type filters
- `project-status-badge.tsx` — Status indicator
- `delete-project-button.tsx` — Deletion handler

**Roadmap Components** (`src/components/admin/roadmap/`):
- `roadmap-form.tsx` — Create/edit roadmap
- `roadmap-list.tsx` — Roadmap listing
- `roadmap-card.tsx` — Preview card
- `roadmap-node-tree.tsx` — Hierarchical tree view
- `roadmap-node-item.tsx` — Individual node
- `roadmap-node-form.tsx` — Node edit form
- `roadmap-detail-actions.tsx` — Actions toolbar

**Review Components** (`src/components/admin/review/`):
- `review-queue.tsx` — Spaced repetition queue UI
- `review-card.tsx` — Review item display

**Settings Components** (`src/components/admin/settings/`):
- `profile-form.tsx` — User profile editor

## Authentication Flow

### Middleware (`src/middleware.ts`)
1. Request arrives → `updateSession()`
2. Supabase SSR client checks session cookies
3. `getUser()` returns authenticated user or null
4. Rate limiting check: `/login` route limited to 5 requests per 60 seconds per IP
5. Admin routes (`/dashboard`, `/learning`, `/projects`) require user
6. Unauthenticated → Redirect to `/login`
7. Authenticated → Continue

### Security: Rate Limiting (`src/lib/rate-limiter.ts`)
- **In-memory IP-based rate limiter**: Tracks request count per IP address
- **Login protection**: 5 requests per 60-second window per IP
- **No external dependencies**: Lightweight implementation suitable for single-instance deployments
- **Auto-reset**: Window resets after duration expires

### Session Management
- Cookies managed by Supabase SSR client
- Server component `createServerClient()` for API routes
- Client component `createBrowserClient()` for interactive elements

## Database Schema (11 Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User metadata (display_name, bio, avatar, contact info) |
| `notes` | Learning content by topic (ai-ml, coding, english, japanese, other) |
| `review_schedule` | Spaced repetition: next_review, level, last_reviewed |
| `bookmarks` | Saved URLs with status (saved/reading/done/noted) |
| `projects` | Project records: name, type, status, visibility, tech_stack |
| `project_docs` | Project documentation (markdown) |
| `project_milestones` | Trackable goals with status, deadline, completion |
| `lessons_learned` | Reflections per project |
| `roadmaps` | Learning paths grouped by topic |
| `roadmap_nodes` | Hierarchical roadmap items (tree structure) |
| `entity_links` | Cross-document relationships (note→project, etc.) |
| `activity_log` | User action history (entity, action, timestamp) |

### RLS (Row-Level Security)
- All tables scoped to authenticated `user_id`
- Public visibility controlled via `visibility` column (not RLS)
- Admin queries filter by session user

## Cross-Linking System

The `entity_links` table enables relationships between knowledge entities (notes, projects, bookmarks, roadmaps).

**Shared Components** (`src/components/shared/`):
- `entity-link-button.tsx` — Add/manage links from any entity
- `entity-link-dialog.tsx` — Modal for linking entities together
- `linked-entities-list.tsx` — Display related notes, projects, bookmarks
- `markdown-editor.tsx` — Markdown input for notes and docs

**Server Actions** (`src/lib/actions/`):
- `entity-link-actions.ts` — Create/delete/query entity relationships
- `dashboard-actions.ts` — Fetch dashboard widget data
- `profile-actions.ts` — User profile CRUD
- `roadmap-actions.ts` — Roadmap and node management
- `note-actions.ts` — Note CRUD and search
- `project-actions.ts` — Project CRUD
- `bookmark-actions.ts` — Bookmark management
- `review-actions.ts` — Review schedule and marking completion
- `activity-actions.ts` — Activity log queries
- `storage-actions.ts` — File/image uploads
- `milestone-actions.ts` — Milestone CRUD

**Review Logic** (`src/lib/review/`):
- `spaced-repetition.ts` — SM-2 algorithm implementation for review scheduling

## Component Architecture

### Server Components (Default)
- Route handlers, page layouts
- Database queries, Supabase auth checks
- Markdown rendering for notes/docs
- Entity link queries and display

### Client Components
- Interactive elements (forms, modals, tabs)
- Theme switcher (`next-themes` integration)
- UI state (expanded sidebars, sorting, filters)
- Entity link dialog and selection

### UI Library
- shadcn/ui for primitive components (Button, Dialog, Tabs, Badge, etc.)
- Lucide React for icons
- TailwindCSS 4 for styling

### Type System (`src/types/`)
- `database.ts` — Auto-generated from Supabase schema
- `index.ts` — Custom types (entities, filters, activity, etc.)

## Data Flow Examples

### Create a Note
1. User submits form (client component)
2. `note-actions.ts` server action calls Supabase `insert()`
3. Middleware ensures user_id matches session
4. RLS policy enforces ownership
5. `activity_log` entry created
6. Page refetch displays new note

### Link a Note to a Project
1. User clicks "Add link" in note detail view
2. `entity-link-dialog.tsx` opens project selector
3. Confirmation calls `entity-link-actions.ts`
4. `entity_links` table records relationship
5. `linked-entities-list.tsx` updates both views

### Spaced Repetition Review
1. Review queue loads notes where `next_review <= NOW()`
2. User studies and submits rating (1-5)
3. `review-actions.ts` calls spaced-repetition algorithm
4. `next_review` and `level` updated in `review_schedule`
5. Activity logged, queue refreshes

## Public/Portfolio Features

### Visibility Control
- Notes, projects, bookmarks can be marked `public` via `visibility` column
- Public pages filter by `visibility='public'` without RLS checks
- Unauthenticated users see `/projects`, `/blog`, `/resume` pages

### Blog System
- Blog posts stored as `notes` or `project_docs` with `visibility='public'`
- `/blog` lists public articles by date
- `/blog/[id]` renders markdown with metadata

### Resume/CV
- Resume data from `projects` table (featured/public projects)
- Skills from `profiles.skills` or inferred from project tech_stack
- `/resume` displays formatted CV with linked projects

## Deployment

- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL + Auth)
- **Environment**: `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- **Build**: Next.js 15+ App Router with SSG + SSR hybrid
- **SEO**: `sitemap.ts`, `robots.ts`, metadata in page.tsx files
