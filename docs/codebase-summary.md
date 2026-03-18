# Codebase Summary

## Project Overview

**Personal Hub** is a single-user productivity platform combining learning management (spaced repetition), project tracking, and public portfolio capabilities in a unified knowledge system.

- **Stack**: Next.js 15 (App Router), Supabase (Auth + PostgreSQL), TypeScript, Tailwind CSS 4
- **Hosting**: Vercel
- **Status**: Phase 06 Complete (Public Portfolio & Roadmap features)

## Directory Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (public)/                  # Unauthenticated routes
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Public layout
│   │   ├── projects/
│   │   │   ├── page.tsx           # Projects showcase
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Project detail
│   │   ├── blog/
│   │   │   ├── page.tsx           # Blog listing
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Blog post reader
│   │   └── resume/
│   │       └── page.tsx           # Resume/CV page
│   ├── (auth)/                    # Auth routes
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx           # Login form
│   ├── (admin)/                   # Admin routes (protected by middleware)
│   │   ├── layout.tsx             # Admin layout with sidebar
│   │   └── admin/
│   │       ├── dashboard/
│   │       │   └── page.tsx       # Dashboard overview
│   │       ├── learning/
│   │       │   ├── notes/
│   │       │   │   ├── page.tsx   # Notes list
│   │       │   │   ├── new/
│   │       │   │   │   └── page.tsx
│   │       │   │   └── [id]/
│   │       │   │       ├── page.tsx # Note detail
│   │       │   │       └── edit/
│   │       │   │           └── page.tsx
│   │       │   ├── bookmarks/
│   │       │   │   ├── page.tsx   # Bookmarks list
│   │       │   │   └── new/
│   │       │   │       └── page.tsx
│   │       │   ├── review/
│   │       │   │   └── page.tsx   # Spaced repetition queue
│   │       │   └── roadmap/
│   │       │       ├── page.tsx   # Roadmap list
│   │       │       ├── new/
│   │       │       │   └── page.tsx
│   │       │       └── [id]/
│   │       │           └── page.tsx
│   │       ├── projects/
│   │       │   ├── page.tsx       # Projects dashboard
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx   # Project detail
│   │       │       └── edit/
│   │       │           └── page.tsx
│   │       └── settings/
│   │           └── page.tsx       # User profile settings
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Tailwind CSS + custom styles
│   ├── robots.ts                  # SEO: robots.txt (Googlebot, disallowed paths)
│   └── sitemap.ts                 # SEO: dynamic sitemap (projects, blog, resume)
│
├── components/                    # React components
│   ├── ui/                        # shadcn/ui primitive components
│   │   └── [button.tsx, dialog.tsx, input.tsx, etc.]
│   ├── shared/                    # Shared cross-feature components
│   │   ├── entity-link-button.tsx     # Button to add/manage links
│   │   ├── entity-link-dialog.tsx     # Modal for entity linking
│   │   ├── linked-entities-list.tsx   # Display related items
│   │   └── markdown-editor.tsx        # Markdown input
│   ├── public/                    # Public-facing components
│   │   ├── public-navbar.tsx      # Navigation header
│   │   ├── public-footer.tsx      # Footer section
│   │   ├── about-section.tsx      # About/intro block
│   │   ├── project-showcase-grid.tsx  # Projects grid
│   │   ├── project-showcase-card.tsx  # Project card
│   │   ├── project-detail-view.tsx    # Full project page
│   │   ├── blog-post-list.tsx     # Articles listing
│   │   ├── blog-post-card.tsx     # Article preview
│   │   ├── blog-post-content.tsx  # Article reader
│   │   └── resume-content.tsx     # Resume display
│   └── admin/                     # Admin-specific components
│       ├── admin-sidebar.tsx      # Navigation sidebar
│       ├── admin-sidebar-nav.tsx  # Sidebar menu items
│       ├── dashboard/             # Dashboard widgets
│       │   ├── dashboard-grid.tsx        # Layout container
│       │   ├── quick-actions-widget.tsx  # Add buttons
│       │   ├── active-projects-widget.tsx    # In-progress projects
│       │   ├── review-due-widget.tsx        # Review stats
│       │   └── recent-activity-widget.tsx   # Activity log
│       ├── notes/                 # Note management
│       │   ├── note-form.tsx      # Create/edit form
│       │   ├── note-list.tsx      # List with pagination
│       │   ├── note-card.tsx      # Preview card
│       │   ├── note-detail.tsx    # Full content viewer
│       │   ├── note-filters.tsx   # Topic/status filters
│       │   └── delete-note-button.tsx
│       ├── bookmarks/             # Bookmark management
│       │   ├── bookmark-form.tsx  # Create/edit form
│       │   └── bookmark-list.tsx  # List with status
│       ├── projects/              # Project management
│       │   ├── project-form.tsx       # Create/edit form
│       │   ├── project-list-view.tsx  # Table/list view
│       │   ├── project-kanban.tsx     # Kanban by status
│       │   ├── project-card.tsx       # Preview card
│       │   ├── project-overview.tsx   # Summary block
│       │   ├── project-detail-tabs.tsx    # Docs/milestones/links
│       │   ├── project-docs-editor.tsx    # Markdown editor
│       │   ├── milestone-form.tsx     # Create/edit
│       │   ├── milestone-list.tsx     # List view
│       │   ├── lessons-learned-editor.tsx # Post-mortem
│       │   ├── project-filters.tsx    # Status/type filters
│       │   ├── project-status-badge.tsx   # Status indicator
│       │   └── delete-project-button.tsx
│       ├── roadmap/               # Learning path management
│       │   ├── roadmap-form.tsx       # Create/edit roadmap
│       │   ├── roadmap-list.tsx       # Roadmap listing
│       │   ├── roadmap-card.tsx       # Preview card
│       │   ├── roadmap-node-tree.tsx  # Hierarchical view
│       │   ├── roadmap-node-item.tsx  # Individual node
│       │   ├── roadmap-node-form.tsx  # Node edit
│       │   └── roadmap-detail-actions.tsx # Actions toolbar
│       ├── review/                # Spaced repetition queue
│       │   ├── review-queue.tsx   # Queue UI
│       │   └── review-card.tsx    # Review item
│       └── settings/              # User settings
│           └── profile-form.tsx   # Profile editor
│
├── lib/                           # Utilities & services
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── middleware.ts          # Auth middleware
│   ├── actions/                   # Server actions (RSC)
│   │   ├── note-actions.ts        # Note CRUD & search
│   │   ├── bookmark-actions.ts    # Bookmark CRUD
│   │   ├── project-actions.ts     # Project CRUD
│   │   ├── milestone-actions.ts   # Milestone CRUD
│   │   ├── roadmap-actions.ts     # Roadmap & node management
│   │   ├── review-actions.ts      # Review schedule updates
│   │   ├── entity-link-actions.ts # Cross-entity relationships
│   │   ├── dashboard-actions.ts   # Dashboard data fetching
│   │   ├── profile-actions.ts     # User profile updates
│   │   ├── activity-actions.ts    # Activity log queries
│   │   └── storage-actions.ts     # File/image uploads
│   ├── review/
│   │   └── spaced-repetition.ts   # SM-2 algorithm
│   └── utils.ts                   # Helpers (cn, formatting, etc.)
│
├── types/                         # TypeScript interfaces
│   ├── database.ts                # Auto-generated from Supabase
│   └── index.ts                   # Custom types (entities, filters, etc.)
│
└── styles/
    └── globals.css                # Tailwind config + global styles
```

## Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User metadata | user_id, display_name, bio, avatar_url, contact_info |
| `notes` | Learning content | id, user_id, title, content (markdown), topic, visibility, created_at |
| `review_schedule` | Spaced repetition tracking | id, user_id, note_id, next_review, level, last_reviewed |
| `bookmarks` | Saved URLs | id, user_id, url, title, status (saved/reading/done/noted), created_at |
| `projects` | Project records | id, user_id, name, type, status, visibility, tech_stack, created_at |
| `project_docs` | Project documentation | id, project_id, content (markdown), created_at |
| `project_milestones` | Trackable goals | id, project_id, title, status, deadline, created_at |
| `lessons_learned` | Post-project reflections | id, project_id, content (markdown), created_at |
| `roadmaps` | Learning paths | id, user_id, title, topic, visibility, created_at |
| `roadmap_nodes` | Hierarchical nodes | id, roadmap_id, parent_id, title, content, order |
| `entity_links` | Cross-document relationships | id, user_id, source_entity (notes/projects/bookmarks/roadmaps), source_id, target_entity, target_id, created_at |
| `activity_log` | User action history | id, user_id, entity (notes/projects/bookmarks/roadmaps), action (create/update/delete), entity_id, timestamp |

### RLS (Row-Level Security)
- All tables scoped to authenticated `user_id`
- Public visibility controlled via `visibility` column (not RLS)
- Queries filter by session user automatically

## Key Features by Phase

### Phase 01: Core Infrastructure
- ✅ Next.js 15 App Router setup
- ✅ Supabase Auth integration
- ✅ Database schema design (11 tables)
- ✅ Middleware for protected routes
- ✅ TypeScript strict mode

### Phase 02: Admin Core Features
- ✅ User profiles
- ✅ Note CRUD (5 topics: AI/ML, coding, languages, other)
- ✅ Bookmark management (4 statuses)
- ✅ Project CRUD with tech stack
- ✅ Spaced repetition (SM-2 algorithm)
- ✅ Activity logging

### Phase 03: Advanced Admin Features
- ✅ Project documentation (markdown editor)
- ✅ Milestone tracking
- ✅ Lessons learned (post-mortem notes)
- ✅ Note filtering by topic/status
- ✅ Project filtering by status/type
- ✅ Review queue UI

### Phase 04: Cross-Linking & Entity Relationships
- ✅ Entity links table (note↔project↔bookmark↔roadmap)
- ✅ Entity link dialog (modal for linking)
- ✅ Linked entities list (bidirectional display)
- ✅ Entity link button (quick access)

### Phase 05: Dashboard & Analytics
- ✅ Dashboard overview with widgets
- ✅ Quick actions (add note/project/bookmark)
- ✅ Active projects widget (in-progress count)
- ✅ Review due widget (spaced repetition stats)
- ✅ Recent activity widget (activity log)

### Phase 06: Public Portfolio & Roadmap
- ✅ Roadmap system (hierarchical learning paths)
- ✅ Roadmap CRUD (create/edit/delete nodes)
- ✅ Public project showcase (filtered by visibility)
- ✅ Public blog system (articles from public notes)
- ✅ Resume/CV page
- ✅ Public navbar & footer
- ✅ SEO: sitemap.ts and robots.ts

## Server Actions Reference

All server actions are in `src/lib/actions/` and follow the pattern:
- Async functions marked with `'use server'` directive
- Take validated input parameters
- Return `{data, error}` tuples
- Handle Supabase queries and RLS enforcement
- Log activity to `activity_log` table

### Note Actions (`note-actions.ts`)
- `createNote(title, content, topic)` — Create note
- `updateNote(noteId, title, content, topic)` — Update
- `deleteNote(noteId)` — Delete with activity log
- `getNotes(topic?, search?)` — Fetch with filters
- `getNoteDetail(noteId)` — Get single note + links

### Project Actions (`project-actions.ts`)
- `createProject(name, type, tech_stack, visibility)` — Create
- `updateProject(projectId, ...)` — Update
- `deleteProject(projectId)` — Delete
- `getProjects(status?, type?)` — List with filters
- `getProjectDetail(projectId)` — Get with docs/milestones/links

### Roadmap Actions (`roadmap-actions.ts`)
- `createRoadmap(title, topic)` — Create
- `updateRoadmap(roadmapId, ...)` — Update
- `deleteRoadmap(roadmapId)` — Delete
- `createRoadmapNode(roadmapId, parentId, title, content)` — Node creation
- `getRoadmapDetail(roadmapId)` — Get with hierarchical nodes

### Entity Link Actions (`entity-link-actions.ts`)
- `createEntityLink(sourceEntity, sourceId, targetEntity, targetId)` — Link creation
- `deleteEntityLink(linkId)` — Remove link
- `getLinkedEntities(entityType, entityId)` — Fetch related items

### Review Actions (`review-actions.ts`)
- `getReviewQueue()` — Fetch notes due for review
- `submitReview(noteId, rating)` — Update next_review via SM-2
- `getReviewStats()` — Fetch progress metrics

### Dashboard Actions (`dashboard-actions.ts`)
- `getDashboardStats()` — Fetch all widget data
- `getRecentActivity(limit)` — Activity log summary
- `getActiveProjectsCount()` — In-progress projects

## Component Patterns

### Form Components
- Built with client components (`'use client'`)
- Use shadcn/ui form primitives (Input, Textarea, Select, etc.)
- Call server actions on submit
- Handle loading and error states
- Example: `note-form.tsx`, `project-form.tsx`

### List Components
- Server components for initial fetch
- Display data in table/card layouts
- Integrate filters and search
- Example: `note-list.tsx`, `project-list-view.tsx`

### Dialog Components
- Client components with state management
- Use shadcn/ui Dialog primitive
- Close on successful submission
- Example: `entity-link-dialog.tsx`

### Widget Components
- Server components fetching aggregated data
- Display dashboard metrics and summaries
- Lightweight and fast-loading
- Example: `review-due-widget.tsx`, `active-projects-widget.tsx`

## Authentication Flow

1. User visits `/login` or protected route
2. Middleware checks session via `getUser()`
3. If no session → redirect to `/login`
4. User submits credentials → Supabase Auth
5. Session cookie set (SSR-managed)
6. Redirect to `/admin/dashboard`
7. Protected routes now accessible

## Type Safety

### Database Types
- Auto-generated from Supabase schema: `src/types/database.ts`
- Import with `import type { Database } from '@/types/database'`

### Custom Types (`src/types/index.ts`)
- Entity filters, activity enums, link relationships
- Shared across components and server actions

## Performance Considerations

- **Code splitting**: Dynamic imports for heavy components
- **Image optimization**: Next.js Image component for assets
- **Lazy loading**: Route-level code splitting
- **Database**: Indexed queries on user_id, created_at
- **Caching**: Revalidate on mutation via Next.js cache

## Security

- **RLS**: All queries filtered by user_id (database level)
- **Input validation**: Sanitize before database insert
- **Secrets**: .env.local never committed
- **CORS**: Handled by Supabase (no additional config)
- **Authentication**: Supabase SSR middleware enforces session

## Deployment

- **Hosting**: Vercel (automatic deployments from GitHub)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Environment**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Build**: `next build` → optimization → deployment

## Testing Strategy (Phase 07)

- **Unit**: Utilities, spaced-repetition algorithm, formatters
- **Integration**: Server actions, database queries, RLS enforcement
- **E2E**: Auth flow, note CRUD, entity linking, review workflow
- **Coverage target**: >80% for core features

