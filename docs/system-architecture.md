# System Architecture

## Route Groups

### Public Routes `(public)`
- `GET /` — Landing page (marketing, CTA to login)
- `GET /portfolio` — Showcase public projects/notes (visibility filter applied)

### Auth Routes `(auth)`
- `GET /login` — Authentication form
- `POST /auth/login` — Credential submission (Supabase Auth)
- `GET /callback` — OAuth redirect handler (if enabled)

### Admin Routes `(admin)`
Protected by middleware. Redirects unauthenticated users to `/login`.
- `GET /dashboard` — Overview, recent activity, navigation
- `GET /learning` — Notes list, roadmaps, review schedule view
- `GET /projects` — Projects dashboard, milestones, filters
- Additional nested routes for detail views and modals

## Authentication Flow

### Middleware (`src/lib/supabase/middleware.ts`)
1. Request arrives → `updateSession()`
2. Supabase SSR client checks session cookies
3. `getUser()` returns authenticated user or null
4. Admin routes (`/dashboard`, `/learning`, `/projects`) require user
5. Unauthenticated → Redirect to `/login`
6. Authenticated → Continue

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

## Component Architecture

### Server Components (Default)
- Route handlers, page layouts
- Database queries, Supabase auth checks
- Markdown rendering for notes/docs

### Client Components
- Interactive elements (forms, modals, tabs)
- Theme switcher (`next-themes` integration)
- UI state (expanded sidebars, sorting, filters)

### UI Library
- shadcn/ui for primitive components (Button, Dialog, Tabs, Badge, etc.)
- Lucide React for icons
- TailwindCSS 4 for styling

## Data Flow: Create a Note

1. User submits form (client component)
2. Server action calls Supabase `insert()`
3. Middleware ensures user_id matches session
4. RLS policy enforces ownership
5. `activity_log` entry created
6. Page refetch displays new note

## Deployment

- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL + Auth)
- **Environment**: `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- **Build**: Next.js 16.1.7 SSG + SSR hybrid
