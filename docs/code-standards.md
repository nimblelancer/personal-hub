# Code Standards

## TypeScript
- **Strict Mode**: `tsconfig.json` enforces `strict: true`
- No `any` types unless unavoidable (document with `@ts-ignore`)
- Import types from `@/types/database` for Supabase schema
- All function signatures must include return types

## File Organization

### Naming
- **kebab-case** for all filenames: `admin-sidebar.tsx`, `create-note-form.tsx`
- **Descriptive names**: Self-documenting without reading content
- Examples: `spaced-repetition-logic.ts`, `bookmark-status-badge.tsx`

### Size Limits
- **Max 200 LOC** per file (split when exceeded)
- Exceptions: Config files, migrations, types
- If nearing limit: Extract utilities, split components

### File Structure
```
src/
├── app/               # Next.js App Router
│   ├── (public)/      # Unauthenticated routes (landing, projects, blog, resume)
│   ├── (auth)/        # Login/auth routes
│   ├── (admin)/       # Protected admin routes (dashboard, learning, projects)
│   ├── layout.tsx     # Root layout
│   ├── globals.css    # Global styles
│   ├── robots.ts      # SEO robots.txt
│   └── sitemap.ts     # SEO dynamic sitemap
├── components/        # React components
│   ├── ui/            # shadcn/ui primitives (button, dialog, input, etc.)
│   ├── shared/        # Cross-feature components (entity-link-*, markdown-editor)
│   ├── public/        # Public-facing components (navbar, footer, showcase, blog)
│   └── admin/         # Admin-specific components
│       ├── admin-sidebar*
│       ├── dashboard/     # Dashboard widgets
│       ├── notes/         # Note CRUD components
│       ├── bookmarks/     # Bookmark management
│       ├── projects/      # Project management + milestones
│       ├── roadmap/       # Learning path editor
│       ├── review/        # Spaced repetition queue
│       └── settings/      # User profile
├── lib/               # Utilities & services
│   ├── supabase/      # Auth, client, server, middleware
│   ├── actions/       # Server actions (RSC) for all CRUD operations
│   ├── review/        # Spaced repetition algorithm (SM-2)
│   └── utils.ts       # General helpers (cn, formatting, etc.)
├── types/             # TypeScript interfaces
│   ├── database.ts    # Auto-generated from Supabase schema
│   └── index.ts       # Custom types (entities, filters, activity, etc.)
└── styles/            # Global CSS
    └── globals.css    # Tailwind config + custom styles
```

## React Conventions

### Server Components (Default)
- Use for routes, layouts, data fetching
- Never use React hooks (useState, useEffect, etc.)
- Mark client components explicitly: `'use client'` at top
- Example: Page layouts, data fetching wrappers

### Client Components
- Only for interactive features (forms, modals, state)
- Keep minimal, extract logic to server actions
- Example: Form submission calls `serverAction()` then refetch
- Client boundary should be as deep as possible (not at route level)

### Shared Components
- Components used across admin and public sections
- Examples:
  - `entity-link-button.tsx` — Add/manage cross-document links
  - `entity-link-dialog.tsx` — Modal for selecting target entities
  - `linked-entities-list.tsx` — Display bidirectional relationships
  - `markdown-editor.tsx` — Rich markdown input field
- Follow same patterns as admin components

### Public Components
- Components for unauthenticated pages
- Examples:
  - `public-navbar.tsx`, `public-footer.tsx` — Layout
  - `project-showcase-grid.tsx`, `project-showcase-card.tsx` — Project listing
  - `blog-post-list.tsx`, `blog-post-card.tsx`, `blog-post-content.tsx` — Blog
  - `resume-content.tsx` — CV/resume display
  - `about-section.tsx` — Introduction/bio
- Fetch data via server actions or page-level data loading

### shadcn/ui Components
- Use for all primitive UI (Button, Dialog, Input, Tabs, Badge)
- Customize via `className` prop using Tailwind
- Never fork or rewrite shadcn components
- Examples: Button, Dialog, Form, Select, Input, Textarea, Badge, Card

## Styling
- **Tailwind CSS 4** (PostCSS integrated)
- **Utility-first**: Avoid custom CSS unless necessary
- **Dark Mode**: Via `next-themes` provider (light/dark)
- **Spacing**: Use standard scale (4px base unit)

## Server Actions (RSC Pattern)

Server actions in `src/lib/actions/` handle all CRUD operations and data fetching.

### Naming Convention
- `{entity}-actions.ts` pattern (e.g., `note-actions.ts`, `project-actions.ts`)
- Action names: `create{Entity}()`, `update{Entity}()`, `delete{Entity}()`, `get{Entities}()`

### Return Pattern
```typescript
// All actions return {data, error} tuple
try {
  const { data, error } = await createNote(...)
  if (error) return { error: error.message }
  return { data }
} catch (err) {
  return { error: 'Failed to create note' }
}
```

### Activity Logging
- Log all mutations (create/update/delete) to `activity_log` table
- Include: user_id, entity type, action, entity_id, timestamp

### Common Actions
- `getUser()` — Fetch current session user
- `getDashboardStats()` — Fetch all widget data
- `getReviewQueue()` — Fetch notes due for spaced repetition
- `submitReview(noteId, rating)` — Update review schedule via SM-2
- `getLinkedEntities(entityType, entityId)` — Fetch entity relationships

## Database & Queries

### Supabase Client Types
- **Server**: `createServerClient()` in middleware, API routes, server actions
- **Client**: `createBrowserClient()` in client components (discouraged with RSC pattern)
- Auto-generated types from `@/types/database`

### Query Patterns
```typescript
// Server action (preferred)
'use server'
export async function getNotes() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('notes').select()
  return { data, error }
}

// Client component (only if necessary)
const supabase = createBrowserClient()
const { data } = await supabase.from('projects').select()
```

### RLS & User Context
- Always include `user_id` in insert/update
- RLS enforces ownership (no explicit filters needed)
- Use `select()` without `where` — RLS filters automatically
- For public queries: add `visibility='public'` filter explicitly

## Entity Linking Pattern

The `entity_links` table enables cross-referencing between notes, projects, bookmarks, and roadmaps.

### Creating Links
```typescript
// In entity-link-actions.ts
export async function createEntityLink(
  sourceEntity: 'notes' | 'projects' | 'bookmarks' | 'roadmaps',
  sourceId: string,
  targetEntity: 'notes' | 'projects' | 'bookmarks' | 'roadmaps',
  targetId: string
) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('entity_links').insert({
    source_entity: sourceEntity,
    source_id: sourceId,
    target_entity: targetEntity,
    target_id: targetId,
  })
}
```

### Displaying Links
- Use `linked-entities-list.tsx` to display bidirectional relationships
- Component fetches via `getLinkedEntities(entityType, entityId)`
- Shows both incoming and outgoing links with context

### Link Dialog
- `entity-link-dialog.tsx` modal for selecting target entities
- Searchable list of available targets
- Prevents duplicate links

## Spaced Repetition System

Learning system based on SM-2 algorithm in `src/lib/review/spaced-repetition.ts`.

### Review Schedule Management
```typescript
// Update schedule based on user rating (1-5)
const nextReview = calculateNextReview(
  currentLevel,
  currentInterval,
  userRating // 1 (hard) to 5 (easy)
)
// Returns: { nextReview, level, interval }
```

### Review Queue
- `review-actions.ts` fetches notes where `next_review <= NOW()`
- `review-queue.tsx` renders cards for user to study
- Submit rating via `submitReview(noteId, rating)`
- Next review date auto-updates based on SM-2 calculation

### Review Stats
- Dashboard widget shows: due now, due this week, mastered (level 5)
- Updated real-time as user completes reviews

## Error Handling
- Try-catch around async operations
- Log errors to console (or error service when added)
- Return user-friendly error messages (no stack traces to UI)
- Validate input before database submission
- Distinguish between validation errors and system errors

## Testing (Future)
- Unit tests for utilities and business logic
- Integration tests for API routes
- E2E tests for critical flows (auth, CRUD)
- Target: >80% coverage for core features

## Git & Commits
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Keep commits focused (one feature per commit)
- Reference issues if applicable: `fix: #123 prevent duplicate bookmarks`

## Performance
- Code split via Next.js dynamic imports for heavy components
- Image optimization via `next/image`
- Lazy load routes within Admin section
- Monitor Core Web Vitals (LCP, FID, CLS)

## Security
- Never commit `.env.local` (add to `.gitignore`)
- Sanitize user input before database insert
- RLS policies validate all queries server-side
- CORS headers managed by Supabase (no additional config)
