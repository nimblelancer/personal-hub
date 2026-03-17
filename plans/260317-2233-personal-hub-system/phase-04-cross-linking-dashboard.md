# Phase 04 — Cross-Linking & Dashboard

## Context Links
- [Plan Overview](./plan.md)
- [Phase 02 — Learning Lab](./phase-02-learning-lab.md) (dependency)
- [Phase 03 — Project Workshop](./phase-03-project-workshop.md) (dependency)
- [User Requirements — Module 4 & 5](/home/nimblelancer/personal-hub/personal-hub-plan.md)

## Overview
- **Priority**: P1
- **Status**: Pending
- **Effort**: 1 week
- **Depends on**: Phase 02 + Phase 03
- **Description**: Build the entity cross-linking system and admin dashboard with widgets for review due, active projects, recent activity, and quick actions.

## Key Insights
- Entity links are bidirectional: linking A→B also means B→A (query both directions)
- `entity_links` table uses type + UUID pairs — generic but simple
- Dashboard is the admin home page — should load fast (Server Component data fetching)
- Widgets: review due count, active projects, recent activity timeline, quick action buttons
- Entity link UI: "Link to..." button on notes and project detail pages
- Search dialog: search across entity types, select to create link

## Requirements

### Functional
- **Entity Links CRUD**: Create/delete links between any two entities
- **Link UI**: "Link to..." button opens search dialog, search across notes/projects/bookmarks
- **Related Items Sidebar**: On note/project detail, show linked entities
- **Dashboard Widgets**:
  - Review Due: count of notes due today + link to review queue
  - Active Projects: list of in_progress projects + next milestone
  - Recent Activity: timeline of last 20 activities
  - Quick Actions: New Note, New Project, Go to Review buttons
- **Widget Data**: All fetched server-side for fast initial load

### Non-Functional
- Dashboard loads under 500ms (single user, small dataset)
- Entity link search debounced (300ms)
- Dashboard data fetched in parallel (Promise.all)

## Architecture

### Component Structure
```
src/
├── app/(admin)/dashboard/
│   └── page.tsx                    # Dashboard (server component)
├── components/admin/dashboard/
│   ├── dashboard-grid.tsx          # Layout grid for widgets
│   ├── review-due-widget.tsx       # Review count + preview
│   ├── active-projects-widget.tsx  # Project list + milestones
│   ├── recent-activity-widget.tsx  # Activity timeline
│   └── quick-actions-widget.tsx    # Action buttons
├── components/shared/
│   ├── entity-link-button.tsx      # "Link to..." trigger (client)
│   ├── entity-link-dialog.tsx      # Search + select dialog (client)
│   └── linked-entities-list.tsx    # Display linked items
├── lib/actions/
│   ├── entity-link-actions.ts      # CRUD for entity_links
│   └── dashboard-actions.ts        # Data fetching for widgets
```

### Entity Link Data Model
```
entity_links:
  entity_a_type: 'note' | 'project' | 'bookmark' | 'lesson' | 'roadmap_node'
  entity_a_id: uuid
  entity_b_type: same enum
  entity_b_id: uuid

Query for all links of entity X:
  WHERE (entity_a_type = X.type AND entity_a_id = X.id)
     OR (entity_b_type = X.type AND entity_b_id = X.id)
```

### Dashboard Data Flow
```
dashboard/page.tsx (Server Component)
  → Promise.all([
      getReviewDueCount(userId),
      getActiveProjects(userId),
      getRecentActivity(userId, limit: 20),
    ])
  → Pass data to widget components (Server Components)
  → Quick Actions = static links (no data needed)
```

## Related Code Files

### Files to Create
- `src/app/(admin)/dashboard/page.tsx` (replace placeholder)
- `src/components/admin/dashboard/dashboard-grid.tsx`
- `src/components/admin/dashboard/review-due-widget.tsx`
- `src/components/admin/dashboard/active-projects-widget.tsx`
- `src/components/admin/dashboard/recent-activity-widget.tsx`
- `src/components/admin/dashboard/quick-actions-widget.tsx`
- `src/components/shared/entity-link-button.tsx`
- `src/components/shared/entity-link-dialog.tsx`
- `src/components/shared/linked-entities-list.tsx`
- `src/lib/actions/entity-link-actions.ts`
- `src/lib/actions/dashboard-actions.ts`

### Files to Modify
- `src/app/(admin)/learning/notes/[id]/page.tsx` — add linked entities sidebar + link button
- `src/app/(admin)/projects/[id]/page.tsx` — add linked entities sidebar + link button
- `src/components/admin/notes/note-detail.tsx` — integrate linked entities
- `src/components/admin/projects/project-overview.tsx` — integrate linked entities

## Implementation Steps

### Step 1: Entity Link Server Actions (2h)
1. Create `entity-link-actions.ts`:
   - `createEntityLink(aType, aId, bType, bId)` — insert into entity_links (check no duplicate)
   - `deleteEntityLink(linkId)` — remove link
   - `getLinkedEntities(entityType, entityId)` — query both directions, return typed results
   - `searchEntities(query, excludeType?, excludeId?)` — search across notes (title), projects (name), bookmarks (title) for link dialog
2. `searchEntities` implementation: run parallel queries on notes, projects, bookmarks with `ilike` on name/title, union results, return `{ type, id, title }[]`

### Step 2: Entity Link UI Components (3h)
1. Create `entity-link-button.tsx` — Button that opens the link dialog
   - Props: `entityType`, `entityId`
2. Create `entity-link-dialog.tsx` — Client Component
   - Search input with debounce
   - Results grouped by type (Notes, Projects, Bookmarks)
   - Click result → create link → close dialog → revalidate
   - Exclude the current entity from results
3. Create `linked-entities-list.tsx` — display component
   - Shows linked items as clickable chips/cards grouped by type
   - Each item: icon (by type) + title + link to detail page
   - Delete button (X) on each link

### Step 3: Integrate Links into Note Detail (1h)
1. Modify note detail page to fetch linked entities
2. Add `entity-link-button.tsx` to note detail header
3. Add `linked-entities-list.tsx` to note detail sidebar
4. Related projects, bookmarks, lessons shown inline

### Step 4: Integrate Links into Project Detail (1h)
1. Modify project overview tab to show linked entities
2. Add link button to project detail header
3. Show linked notes, bookmarks, other projects

### Step 5: Dashboard Data Actions (2h)
1. Create `dashboard-actions.ts`:
   - `getReviewDueCount(userId)` — count from review_schedule where next_review <= today
   - `getReviewDuePreview(userId, limit: 5)` — top 5 overdue notes (title + days overdue)
   - `getActiveProjects(userId)` — projects where status = 'in_progress', include next pending milestone
   - `getRecentActivity(userId, limit: 20)` — from activity_log, join with entity names
2. All queries use Supabase server client

### Step 6: Dashboard Widgets (3h)
1. Create `dashboard-grid.tsx` — CSS Grid layout (2x2 on desktop, 1 col on mobile)
2. Create `review-due-widget.tsx`:
   - Card with count badge: "5 notes due for review"
   - Preview list of top overdue notes
   - "Go to Review" link button
   - Empty state: "All caught up!"
3. Create `active-projects-widget.tsx`:
   - List of in_progress projects (max 5)
   - Each: project name, type badge, next milestone (if any)
   - "View All Projects" link
   - Empty state: "No active projects"
4. Create `recent-activity-widget.tsx`:
   - Timeline/list of recent activities
   - Each: icon (by action type), description, relative timestamp
   - E.g., "Created note 'RAG Pipeline Basics' — 2 hours ago"
   - Map activity_log entries to readable descriptions
5. Create `quick-actions-widget.tsx`:
   - Button grid: New Note, New Project, Review Queue, Bookmarks
   - Each links to respective create/list page
   - Simple, no data fetching needed

### Step 7: Dashboard Page Assembly (1h)
1. Update `dashboard/page.tsx`:
   - Fetch all widget data with `Promise.all`
   - Render greeting: "Welcome back" + date
   - Render dashboard-grid with all widgets
2. Add loading states (Suspense boundaries or skeleton)

## Todo List
- [ ] Implement entity link Server Actions (CRUD + search)
- [ ] Build entity link dialog with cross-entity search
- [ ] Build linked entities list display component
- [ ] Integrate links into note detail page
- [ ] Integrate links into project detail page
- [ ] Implement dashboard data fetching actions
- [ ] Build review due widget
- [ ] Build active projects widget
- [ ] Build recent activity widget
- [ ] Build quick actions widget
- [ ] Assemble dashboard page with grid layout
- [ ] Test: create links between notes and projects, verify bidirectional display
- [ ] Test: dashboard shows correct counts and data

## Success Criteria
- Can create/delete links between any entity types
- Link dialog searches across notes, projects, bookmarks
- Note detail shows linked projects/bookmarks; project detail shows linked notes
- Dashboard loads with all widgets populated
- Review due count matches actual overdue review_schedule entries
- Active projects list matches in_progress projects
- Activity timeline shows recent actions chronologically
- Quick actions navigate to correct pages
- Mobile-responsive grid layout

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Cross-entity search slow with many entities | Low (single user) | Parallel queries per type; add indexes if needed |
| Activity log entries lack context (no entity names) | Medium | Join with entity tables on read; or denormalize action text |
| Dashboard widget data stale on long sessions | Low | Revalidate on navigation; no real-time needed for single user |

## Security Considerations
- Entity link actions verify auth before any operation
- Search results filtered to user's own entities (RLS handles this)
- Dashboard data fetched server-side — no client exposure of query logic
- Activity log only shows user's own entries (RLS)

## Next Steps
- Phase 05 (Portfolio) uses dashboard as landing page for admin
- Entity links provide context for portfolio project pages (related notes/blog posts)
