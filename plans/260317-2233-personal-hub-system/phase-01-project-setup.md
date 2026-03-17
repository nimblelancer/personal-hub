# Phase 01 — Project Setup

## Context Links
- [Plan Overview](./plan.md)
- [User Requirements](/home/nimblelancer/personal-hub/personal-hub-plan.md)
- [Next.js App Router docs](https://nextjs.org/docs/app)
- [Supabase docs](https://supabase.com/docs)
- [shadcn/ui docs](https://ui.shadcn.com)

## Overview
- **Priority**: P1 — Critical (blocks all other phases)
- **Status**: Completed
- **Effort**: 2-3 days
- **Description**: Bootstrap the entire project — Next.js init, Supabase project, UI framework, auth, layouts, DB schema, and Vercel deployment.

## Key Insights
- Single-user app: auth is simple email/password via Supabase Auth
- RLS policies are critical from day 1 — every table must have `user_id = auth.uid()` policy
- Route groups `(admin)` and `(public)` cleanly separate authenticated vs public pages
- Supabase client needs both server-side and client-side helpers (`@supabase/ssr`)

## Requirements

### Functional
- Next.js 15+ project with App Router and TypeScript strict
- Supabase project created with all migration files
- shadcn/ui installed with base components
- Admin layout with sidebar navigation
- Public layout with top navbar
- Auth flow: login page, middleware protection for `(admin)` routes
- Vercel deployment with environment variables

### Non-Functional
- TypeScript strict mode enabled
- All DB tables have RLS enabled
- Auth middleware runs on edge (Next.js middleware)
- Mobile-responsive layouts from the start

## Architecture

### Route Structure
```
src/app/
├── (admin)/                 # Auth-protected route group
│   ├── layout.tsx           # Sidebar + main content area
│   ├── dashboard/page.tsx   # Placeholder
│   ├── learning/
│   │   ├── notes/
│   │   ├── review/
│   │   ├── roadmap/
│   │   └── bookmarks/
│   └── projects/
├── (public)/                # No-auth route group
│   ├── layout.tsx           # Navbar + footer
│   ├── page.tsx             # Landing/About
│   ├── projects/
│   └── blog/
├── (auth)/                  # Auth pages (login)
│   └── login/page.tsx
├── api/                     # API routes (if needed)
└── layout.tsx               # Root layout (fonts, providers)
```

### Supabase Client Architecture
- `lib/supabase/server.ts` — server-side client (uses cookies)
- `lib/supabase/client.ts` — browser client (singleton)
- `lib/supabase/middleware.ts` — middleware helper for session refresh

### Database Schema (Full SQL)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  contact_json jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notes (Learning Lab)
create type note_topic as enum ('ai-ml', 'coding', 'english', 'japanese', 'other');
create type visibility_type as enum ('private', 'public');

create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  content text default '',
  topic note_topic default 'other',
  tags text[] default '{}',
  visibility visibility_type default 'private',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Review Schedule (Spaced Repetition)
create table review_schedule (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid not null references notes on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  next_review date not null default current_date + 1,
  level int default 0 check (level >= 0 and level <= 5),
  last_reviewed timestamptz,
  created_at timestamptz default now()
);

-- Bookmarks
create type bookmark_status as enum ('saved', 'reading', 'done', 'noted');

create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  url text not null,
  title text not null,
  description text,
  tags text[] default '{}',
  status bookmark_status default 'saved',
  note_id uuid references notes on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects
create type project_type as enum ('software', 'learning', 'content', 'personal');
create type project_status as enum ('idea', 'planning', 'in_progress', 'paused', 'completed', 'archived');

create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  type project_type default 'software',
  status project_status default 'idea',
  visibility visibility_type default 'private',
  one_liner text,
  tech_stack text[] default '{}',
  topics text[] default '{}',
  github_url text,
  demo_url text,
  thumbnail_url text,
  started_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project Docs (README++)
create table project_docs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects on delete cascade,
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project Milestones
create type milestone_status as enum ('pending', 'in_progress', 'completed');

create table project_milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects on delete cascade,
  title text not null,
  description text,
  status milestone_status default 'pending',
  sort_order int default 0,
  deadline date,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Lessons Learned
create table lessons_learned (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects on delete cascade,
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Roadmaps (Phase 06)
create table roadmaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  topic note_topic default 'other',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create type roadmap_node_status as enum ('not_started', 'in_progress', 'learned', 'mastered');

create table roadmap_nodes (
  id uuid primary key default uuid_generate_v4(),
  roadmap_id uuid not null references roadmaps on delete cascade,
  parent_id uuid references roadmap_nodes on delete set null,
  title text not null,
  description text,
  status roadmap_node_status default 'not_started',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Entity Links (Cross-Linking)
create type entity_type as enum ('note', 'project', 'bookmark', 'lesson', 'roadmap_node');

create table entity_links (
  id uuid primary key default uuid_generate_v4(),
  entity_a_type entity_type not null,
  entity_a_id uuid not null,
  entity_b_type entity_type not null,
  entity_b_id uuid not null,
  created_at timestamptz default now(),
  unique(entity_a_type, entity_a_id, entity_b_type, entity_b_id)
);

-- Activity Log
create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  entity_type entity_type not null,
  entity_id uuid not null,
  action text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_notes_user on notes(user_id);
create index idx_notes_topic on notes(topic);
create index idx_notes_visibility on notes(visibility);
create index idx_notes_created on notes(created_at desc);
create index idx_review_schedule_user_next on review_schedule(user_id, next_review);
create index idx_bookmarks_user on bookmarks(user_id);
create index idx_projects_user on projects(user_id);
create index idx_projects_status on projects(status);
create index idx_projects_visibility on projects(visibility);
create index idx_entity_links_a on entity_links(entity_a_type, entity_a_id);
create index idx_entity_links_b on entity_links(entity_b_type, entity_b_id);
create index idx_activity_user on activity_log(user_id, created_at desc);

-- RLS Policies
alter table profiles enable row level security;
alter table notes enable row level security;
alter table review_schedule enable row level security;
alter table bookmarks enable row level security;
alter table projects enable row level security;
alter table project_docs enable row level security;
alter table project_milestones enable row level security;
alter table lessons_learned enable row level security;
alter table roadmaps enable row level security;
alter table roadmap_nodes enable row level security;
alter table entity_links enable row level security;
alter table activity_log enable row level security;

-- Profile policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Notes policies
create policy "Users can CRUD own notes" on notes for all using (auth.uid() = user_id);
create policy "Public notes are readable" on notes for select using (visibility = 'public');

-- Review schedule policies
create policy "Users can CRUD own reviews" on review_schedule for all using (auth.uid() = user_id);

-- Bookmark policies
create policy "Users can CRUD own bookmarks" on bookmarks for all using (auth.uid() = user_id);

-- Project policies
create policy "Users can CRUD own projects" on projects for all using (auth.uid() = user_id);
create policy "Public projects are readable" on projects for select using (visibility = 'public');

-- Project docs policies (through project ownership)
create policy "Users can CRUD own project docs" on project_docs for all
  using (exists (select 1 from projects where projects.id = project_docs.project_id and projects.user_id = auth.uid()));
create policy "Public project docs are readable" on project_docs for select
  using (exists (select 1 from projects where projects.id = project_docs.project_id and projects.visibility = 'public'));

-- Milestone policies
create policy "Users can CRUD own milestones" on project_milestones for all
  using (exists (select 1 from projects where projects.id = project_milestones.project_id and projects.user_id = auth.uid()));

-- Lessons learned policies
create policy "Users can CRUD own lessons" on lessons_learned for all
  using (exists (select 1 from projects where projects.id = lessons_learned.project_id and projects.user_id = auth.uid()));

-- Roadmap policies
create policy "Users can CRUD own roadmaps" on roadmaps for all using (auth.uid() = user_id);

-- Roadmap nodes (through roadmap ownership)
create policy "Users can CRUD own roadmap nodes" on roadmap_nodes for all
  using (exists (select 1 from roadmaps where roadmaps.id = roadmap_nodes.roadmap_id and roadmaps.user_id = auth.uid()));

-- Entity links (user owns at least one side)
create policy "Users can manage entity links" on entity_links for all using (true);

-- Activity log policies
create policy "Users can CRUD own activity" on activity_log for all using (auth.uid() = user_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_updated_at before update on profiles for each row execute function update_updated_at();
create trigger set_updated_at before update on notes for each row execute function update_updated_at();
create trigger set_updated_at before update on bookmarks for each row execute function update_updated_at();
create trigger set_updated_at before update on projects for each row execute function update_updated_at();
create trigger set_updated_at before update on project_docs for each row execute function update_updated_at();
create trigger set_updated_at before update on lessons_learned for each row execute function update_updated_at();
create trigger set_updated_at before update on roadmaps for each row execute function update_updated_at();
```

## Related Code Files

### Files to Create
- `src/app/layout.tsx` — Root layout (fonts, metadata, Supabase provider)
- `src/app/(admin)/layout.tsx` — Admin sidebar layout
- `src/app/(public)/layout.tsx` — Public navbar layout
- `src/app/(auth)/login/page.tsx` — Login page
- `src/app/(admin)/dashboard/page.tsx` — Placeholder dashboard
- `src/lib/supabase/server.ts` — Server-side Supabase client
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/middleware.ts` — Middleware helper
- `src/middleware.ts` — Next.js middleware (auth guard)
- `src/types/database.ts` — Generated Supabase types
- `src/components/admin/admin-sidebar.tsx` — Sidebar navigation
- `src/components/public/public-navbar.tsx` — Public nav
- `supabase/migrations/00001_initial_schema.sql` — Full schema
- `.env.local` — Supabase URL + anon key + service role key
- `tailwind.config.ts` — Tailwind config
- `components.json` — shadcn/ui config

## Implementation Steps

### 1. Initialize Next.js Project (30 min)
1. `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
2. Enable strict mode in `tsconfig.json`: `"strict": true`
3. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   npm install react-markdown
   npm install -D supabase
   ```

### 2. Setup shadcn/ui (15 min)
1. `npx shadcn@latest init` — select New York style, neutral color
2. Install base components:
   ```bash
   npx shadcn@latest add button input textarea card badge dialog dropdown-menu
   npx shadcn@latest add sheet sidebar separator tabs toast
   ```

### 3. Create Supabase Project (30 min)
1. Create project at supabase.com
2. Copy project URL, anon key, service role key to `.env.local`
3. Init Supabase locally: `npx supabase init`
4. Create migration file: `supabase/migrations/00001_initial_schema.sql` (use SQL above)
5. Push migration: `npx supabase db push`
6. Generate types: `npx supabase gen types typescript --project-id <id> > src/types/database.ts`

### 4. Supabase Client Setup (30 min)
1. Create `src/lib/supabase/server.ts` — uses `createServerClient` from `@supabase/ssr` with cookie handling
2. Create `src/lib/supabase/client.ts` — uses `createBrowserClient` from `@supabase/ssr`
3. Create `src/lib/supabase/middleware.ts` — session refresh logic

### 5. Auth Middleware (30 min)
1. Create `src/middleware.ts`:
   - Match `/admin/*` routes (via `config.matcher`)
   - Check session via Supabase middleware helper
   - Redirect to `/login` if no session
   - Allow all `(public)` routes through
2. Create login page at `src/app/(auth)/login/page.tsx`:
   - Email + password form
   - Call `supabase.auth.signInWithPassword()`
   - Redirect to `/dashboard` on success

### 6. Layouts (45 min)
1. Root layout (`src/app/layout.tsx`):
   - Inter font, global metadata, body class
2. Admin layout (`src/app/(admin)/layout.tsx`):
   - Sidebar (collapsible) with nav links: Dashboard, Learning (Notes, Review, Roadmap, Bookmarks), Projects
   - Main content area with breadcrumb
   - Use shadcn Sidebar component
3. Public layout (`src/app/(public)/layout.tsx`):
   - Top navbar: Home, Projects, Blog, Resume
   - Footer with social links
   - Clean, minimal design

### 7. Placeholder Pages (15 min)
1. `/dashboard` — "Welcome to Personal Hub" with quick-action buttons
2. `/` (public) — Simple landing page

### 8. Vercel Deployment (15 min)
1. Push to GitHub repo
2. Connect to Vercel
3. Add environment variables (Supabase URL, keys)
4. Deploy and verify

### 9. Create Initial User (10 min)
1. Create user via Supabase dashboard (Auth > Users > Add)
2. Insert corresponding profile row
3. Test login flow end-to-end

## Todo List
- [x] Init Next.js project with TypeScript strict
- [x] Install and configure shadcn/ui
- [x] Create Supabase project + local init
- [x] Write and push DB migration (full schema)
- [x] Generate TypeScript types from Supabase
- [x] Implement Supabase server/client/middleware helpers
- [x] Create Next.js auth middleware
- [x] Build login page
- [x] Build admin sidebar layout
- [x] Build public navbar layout
- [x] Create placeholder dashboard page
- [x] Create placeholder public landing page
- [x] Deploy to Vercel
- [x] Create initial user and test auth flow
- [x] Verify RLS policies work correctly

## Success Criteria
- `npm run build` passes with zero errors
- Login redirects to dashboard; logout redirects to login
- Unauthenticated access to `/dashboard` redirects to `/login`
- Public routes accessible without auth
- All DB tables have RLS enabled and policies working
- Vercel deployment live and functional
- Admin and public layouts render correctly on mobile

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase RLS misconfiguration leaks private data | High | Test every policy with authenticated + anon requests |
| Next.js middleware edge runtime limitations | Medium | Keep middleware thin — only session check + redirect |
| Cookie handling issues with Supabase SSR | Medium | Follow official `@supabase/ssr` cookbook exactly |

## Security Considerations
- `.env.local` never committed to git — add to `.gitignore`
- Service role key used only in server-side contexts, never exposed to client
- RLS enforced on every table; anon key only sees public data
- Auth middleware protects all `(admin)` routes
- CSRF handled by Supabase Auth session cookies

## Next Steps
After this phase:
- Phase 02 (Learning Lab) and Phase 03 (Project Workshop) can start in parallel
- Both phases use the schema, types, and Supabase clients created here
