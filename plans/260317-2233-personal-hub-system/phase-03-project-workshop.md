# Phase 03 — Project Workshop

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01 — Project Setup](./phase-01-project-setup.md) (dependency)
- [Phase 02 — Learning Lab](./phase-02-learning-lab.md) (parallel, shares markdown-editor)
- [User Requirements — Module 2](/home/nimblelancer/personal-hub/personal-hub-plan.md)

## Overview
- **Priority**: P1 — Core feature
- **Status**: completed
- **Effort**: 1-1.5 weeks
- **Depends on**: Phase 01
- **Description**: Build the Project Workshop — project registry CRUD, auto-generated docs template, milestones tracking, lessons learned log, and kanban/list view.

## Key Insights
- Projects are the second core entity alongside notes
- Auto-generate README++ docs template when creating a new project
- Kanban view by status is the primary view; list view as alternative
- Milestones are simple: title + status + optional deadline (no Jira complexity)
- Lessons learned: prompted when project status changes to "completed"
- `visibility: public` flag → project appears on public portfolio
- Reuse markdown-editor component from Phase 02

## Requirements

### Functional
- **Project CRUD**: Create, read, update, delete projects
- **Project Metadata**: name, type, status, visibility, one_liner, tech_stack[], topics[], github_url, demo_url, thumbnail_url, started_at
- **Auto-gen Docs**: On project create → insert `project_docs` row with README++ template
- **Docs Editor**: Markdown editor for project docs (reuse from Phase 02)
- **Kanban View**: Columns by status (idea, planning, in_progress, paused, completed, archived); drag optional
- **List View**: Table/card list with sort and filter
- **Filter**: By type, status, tech_stack, topics, visibility
- **Project Detail**: Tabs — Overview, Docs, Milestones, Lessons Learned
- **Milestones CRUD**: Per-project milestones with title, description, status, deadline, sort order
- **Lessons Learned**: Markdown content per project; prompted on completion
- **Image Upload**: Upload thumbnail/screenshots to Supabase Storage
- **Status Transitions**: When status → completed, prompt to write lessons learned

### Non-Functional
- Server Components for list/detail pages
- Client Components for kanban board, forms, editors
- Image uploads go to Supabase Storage bucket `project-images`
- Thumbnail max size: 2MB

## Architecture

### Component Structure
```
src/
├── app/(admin)/projects/
│   ├── page.tsx                  # Project list/kanban (server)
│   ├── new/page.tsx              # Create project
│   └── [id]/
│       ├── page.tsx              # Project detail (tabs)
│       └── edit/page.tsx         # Edit project metadata
├── components/admin/projects/
│   ├── project-form.tsx          # Create/edit form (client)
│   ├── project-kanban.tsx        # Kanban board (client)
│   ├── project-list-view.tsx     # List/table view
│   ├── project-card.tsx          # Card used in kanban + list
│   ├── project-filters.tsx       # Filter bar
│   ├── project-detail-tabs.tsx   # Tab container (client)
│   ├── project-overview.tsx      # Overview tab content
│   ├── project-docs-editor.tsx   # Docs tab — markdown editor
│   ├── milestone-list.tsx        # Milestones tab content
│   ├── milestone-form.tsx        # Add/edit milestone
│   └── lessons-learned-editor.tsx # Lessons tab — markdown editor
├── lib/actions/
│   ├── project-actions.ts        # Server Actions for projects
│   ├── milestone-actions.ts      # Server Actions for milestones
│   └── storage-actions.ts        # Image upload helpers
```

### Data Flow
1. **Create Project**: Form submit → Server Action → insert `projects` + insert `project_docs` (with template) → log activity → redirect to detail
2. **Edit Docs**: Auto-save on blur or explicit save button → Server Action updates `project_docs.content`
3. **Kanban Drag** (optional v1.1): Update project status via Server Action → revalidate
4. **Complete Project**: Status change to "completed" → show modal prompting lessons learned → create/update `lessons_learned` row

### README++ Template (auto-generated)
```markdown
# {Project Name}

## Problem
Why did I build this? What problem does it solve?

## Solution
My approach and why I chose it.

## Tech Stack
| Technology | Role | Why |
|---|---|---|
| ... | ... | ... |

## Architecture
Describe the system architecture.

## How to Run
Step-by-step setup instructions.

## Key Features
- Feature 1
- Feature 2

## Screenshots / Demo
Add screenshots or demo links here.

## What I Learned
Fill this after completing the project.
```

## Related Code Files

### Files to Create
- `src/app/(admin)/projects/page.tsx`
- `src/app/(admin)/projects/new/page.tsx`
- `src/app/(admin)/projects/[id]/page.tsx`
- `src/app/(admin)/projects/[id]/edit/page.tsx`
- `src/components/admin/projects/project-form.tsx`
- `src/components/admin/projects/project-kanban.tsx`
- `src/components/admin/projects/project-list-view.tsx`
- `src/components/admin/projects/project-card.tsx`
- `src/components/admin/projects/project-filters.tsx`
- `src/components/admin/projects/project-detail-tabs.tsx`
- `src/components/admin/projects/project-overview.tsx`
- `src/components/admin/projects/project-docs-editor.tsx`
- `src/components/admin/projects/milestone-list.tsx`
- `src/components/admin/projects/milestone-form.tsx`
- `src/components/admin/projects/lessons-learned-editor.tsx`
- `src/lib/actions/project-actions.ts`
- `src/lib/actions/milestone-actions.ts`
- `src/lib/actions/storage-actions.ts`

### Files to Reuse
- `src/components/shared/markdown-editor.tsx` (from Phase 02)

## Implementation Steps

### Step 1: Project Server Actions (2h)
1. Create `project-actions.ts`:
   - `createProject(formData)` — insert project + project_docs (template) + activity_log
   - `updateProject(id, formData)` — update project fields
   - `deleteProject(id)` — delete project (cascades)
   - `getProjects(filters)` — list with filters, support both kanban grouping and flat list
   - `getProject(id)` — single project with docs, milestones, lessons
   - `updateProjectStatus(id, status)` — dedicated status update (for kanban)
2. Template generation: use project name to fill README++ template string

### Step 2: Project Form (2h)
1. Create `project-form.tsx` — Client Component
2. Fields: name (input), type (select), status (select), visibility (toggle), one_liner (input), tech_stack (multi-input chips), topics (multi-input chips), github_url, demo_url, started_at (date picker)
3. Thumbnail upload: file input → call storage action → store URL
4. Reuse tag-chip input pattern from notes

### Step 3: Kanban View (3h)
1. Create `project-kanban.tsx` — Client Component
2. Columns: one per status enum value (idea, planning, in_progress, paused, completed, archived)
3. Each column renders project cards with: name, one_liner, tech badges, type badge
4. Click card → navigate to detail page
5. **v1**: No drag-and-drop (YAGNI); status change via detail page or dropdown on card
6. **v1.1 (optional)**: Add `@dnd-kit` for drag-and-drop later
7. Show column counts

### Step 4: List View (1h)
1. Create `project-list-view.tsx` — alternative to kanban
2. Table or card-list layout with columns: name, type, status, tech_stack, updated_at
3. Sortable by name, status, updated_at
4. Create `project-filters.tsx` — filter by type, status, tech_stack, topics

### Step 5: Projects List Page (1h)
1. Create `projects/page.tsx` — Server Component
2. Fetch all projects, pass to client view components
3. Toggle between Kanban and List view (persist preference in localStorage)
4. "New Project" button in header

### Step 6: Project Detail Page (3h)
1. Create `projects/[id]/page.tsx` — Server Component, fetch project + related data
2. Create `project-detail-tabs.tsx` — Client Component, four tabs:
   - **Overview**: project-overview.tsx — metadata display, status badge, links, thumbnail
   - **Docs**: project-docs-editor.tsx — markdown editor with save button
   - **Milestones**: milestone-list.tsx — ordered list with inline status toggle
   - **Lessons Learned**: lessons-learned-editor.tsx — markdown editor
3. Header: project name, edit button, delete button, visibility toggle

### Step 7: Milestones CRUD (2h)
1. Create `milestone-actions.ts`:
   - `createMilestone(projectId, data)`
   - `updateMilestone(id, data)`
   - `deleteMilestone(id)`
   - `reorderMilestones(projectId, orderedIds)`
2. Create `milestone-list.tsx` — ordered list, each row: title, status badge, deadline, toggle status button
3. Create `milestone-form.tsx` — dialog/inline form: title, description, deadline, status
4. Simple reordering via move up/down buttons (no drag-and-drop)

### Step 8: Lessons Learned (1h)
1. Create `lessons-learned-editor.tsx` — wraps markdown-editor
2. If no lessons_learned row exists, show template with sections: Technical, Process, Reusable
3. Auto-create row on first save
4. Completion prompt: when project status changes to "completed", show toast/dialog suggesting to write lessons

### Step 9: Image Upload (1h)
1. Create `storage-actions.ts`:
   - `uploadProjectImage(projectId, file)` — upload to `project-images/{projectId}/{filename}`
   - `deleteProjectImage(path)` — remove from storage
2. Create Supabase Storage bucket `project-images` with public read policy
3. Thumbnail upload on project form; screenshot upload in docs
4. Max file size: 2MB, accepted types: jpg, png, webp, gif

### Step 10: Activity Logging (30 min)
1. Add activity logging to all project/milestone/lesson mutations
2. Actions: 'project_created', 'project_updated', 'project_completed', 'milestone_completed', 'lesson_added'

## Todo List
- [x] Implement project Server Actions (CRUD + filters)
- [x] Build project form component
- [x] Build kanban view component
- [x] Build list view component with filters
- [x] Build projects list page with view toggle
- [x] Build project detail page with tabs
- [x] Implement milestone CRUD (actions + components)
- [x] Build lessons learned editor with template
- [x] Implement image upload to Supabase Storage
- [x] Add completion prompt for lessons learned
- [x] Add activity logging to all mutations
- [x] Test full flow: create project → edit docs → add milestones → complete → write lessons

## Success Criteria
- Can create project and see auto-generated docs template
- Project metadata fully editable
- Kanban view shows projects grouped by status
- List view with filters works
- Detail page tabs switch correctly
- Milestones CRUD functional with status toggles
- Lessons learned editor saves and loads content
- Image upload works for thumbnails
- Visibility toggle works (for Phase 05 portfolio)
- Activity log records all mutations

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Kanban drag-and-drop complexity | Medium | Skip DnD in v1; use dropdown status change instead |
| Image upload size/format issues | Low | Validate client-side before upload; reject >2MB |
| Too many components bloating detail page | Medium | Keep tabs lazy-loaded; extract into separate modules |

## Security Considerations
- All Server Actions verify auth before DB operations
- Image uploads validated: type whitelist, size limit
- Supabase Storage bucket: public read (for portfolio), write requires auth
- RLS on project_docs/milestones/lessons via project ownership check
- Delete cascades properly configured in schema

## Next Steps
- Phase 04 (Cross-Linking & Dashboard) links projects to notes and builds dashboard widgets
- Phase 05 (Portfolio) reads public projects for showcase page
