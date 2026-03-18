# Phase 02 — Learning Lab

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01 — Project Setup](./phase-01-project-setup.md) (dependency)
- [User Requirements — Module 1](/home/nimblelancer/personal-hub/personal-hub-plan.md)

## Overview
- **Priority**: P1 — Core feature
- **Status**: completed
- **Effort**: 1.5-2 weeks
- **Depends on**: Phase 01
- **Description**: Build the Learning Lab module — TIL notes CRUD with markdown editor, tag/topic system, search/filter, spaced repetition review queue, and resource bookmarks.

## Key Insights
- Notes are the central entity — used across review queue, portfolio blog, and cross-linking
- Markdown editor = split-pane: left textarea, right react-markdown preview (confirmed KISS decision)
- Review queue shows full note content + self-rate buttons (no flip animation)
- Spaced repetition intervals: 1 → 3 → 7 → 14 → 30 → 90 days
- Self-rate actions: Remember (level up), Fuzzy (stay, review sooner), Forgot (reset to 0)
- `visibility: public` flag → note auto-appears on public blog
- Topic is an enum; tags are freeform text array

## Requirements

### Functional
- **Notes CRUD**: Create, read, update, delete TIL notes
- **Markdown Editor**: Split-pane textarea + react-markdown preview
- **Topic Selection**: Dropdown from enum (AI/ML, Coding, English, Japanese, Other)
- **Tag System**: Multi-select with typeahead; stores as `text[]`
- **Search**: Full-text search on title + content
- **Filter**: By topic, tags, date range, visibility
- **Note List**: Paginated list view with sort (newest first default)
- **Note Detail**: Full markdown render with metadata sidebar
- **Review Queue**: List notes due today, sorted by overdue-first
- **Review Flow**: Show note content → user clicks Remember/Fuzzy/Forgot
- **Auto-schedule**: Creating a note auto-creates a review_schedule row (next_review = tomorrow)
- **Bookmarks CRUD**: Save URLs with tags, status tracking, optional link to note
- **Visibility Toggle**: Mark notes as public/private

### Non-Functional
- Server Components for list/detail pages (SEO for public notes)
- Client Components only for editor, search input, review buttons
- Optimistic UI updates for review actions
- Debounced search (300ms)

## Architecture

### Component Structure
```
src/
├── app/(admin)/learning/
│   ├── notes/
│   │   ├── page.tsx              # Notes list (server component)
│   │   ├── new/page.tsx          # Create note
│   │   ├── [id]/page.tsx         # Note detail
│   │   └── [id]/edit/page.tsx    # Edit note
│   ├── review/
│   │   └── page.tsx              # Review queue
│   └── bookmarks/
│       ├── page.tsx              # Bookmarks list
│       └── new/page.tsx          # Create bookmark
├── components/
│   ├── shared/
│   │   └── markdown-editor.tsx   # Split-pane editor (client)
│   ├── admin/
│   │   ├── notes/
│   │   │   ├── note-form.tsx         # Create/edit form (client)
│   │   │   ├── note-list.tsx         # List with filters (client for interactivity)
│   │   │   ├── note-card.tsx         # Card in list
│   │   │   ├── note-filters.tsx      # Search + filter bar
│   │   │   └── note-detail.tsx       # Detail view
│   │   ├── review/
│   │   │   ├── review-queue.tsx      # Queue list
│   │   │   └── review-card.tsx       # Single review item + rate buttons
│   │   └── bookmarks/
│   │       ├── bookmark-form.tsx
│   │       └── bookmark-list.tsx
├── lib/
│   ├── review/
│   │   └── spaced-repetition.ts  # Interval calculation logic
│   └── actions/
│       ├── note-actions.ts       # Server Actions for notes
│       ├── review-actions.ts     # Server Actions for reviews
│       └── bookmark-actions.ts   # Server Actions for bookmarks
└── types/
    └── index.ts                  # App-level types (NoteWithReview, etc.)
```

### Data Flow
1. **Create Note**: Form submit → Server Action → insert `notes` + insert `review_schedule` (next_review = tomorrow) → log to `activity_log` → redirect to note detail
2. **Review Flow**: Load notes where `next_review <= today` → render queue → user rates → Server Action updates `review_schedule` (recalculate next_review based on level + rating)
3. **Search**: Client-side debounced input → Server Action with `ilike` query on title/content + topic/tag filters

### Spaced Repetition Logic
```
INTERVALS = [1, 3, 7, 14, 30, 90] // days

function calculateNextReview(currentLevel: number, rating: 'remember' | 'fuzzy' | 'forgot'):
  if rating === 'remember':
    newLevel = min(currentLevel + 1, 5)
    nextReview = today + INTERVALS[newLevel]
  elif rating === 'fuzzy':
    newLevel = currentLevel  // stay same
    nextReview = today + max(1, INTERVALS[currentLevel] / 2)  // review at half interval
  elif rating === 'forgot':
    newLevel = 0
    nextReview = today + 1  // review tomorrow

  return { newLevel, nextReview, lastReviewed: now() }
```

## Related Code Files

### Files to Create
- `src/app/(admin)/learning/notes/page.tsx`
- `src/app/(admin)/learning/notes/new/page.tsx`
- `src/app/(admin)/learning/notes/[id]/page.tsx`
- `src/app/(admin)/learning/notes/[id]/edit/page.tsx`
- `src/app/(admin)/learning/review/page.tsx`
- `src/app/(admin)/learning/bookmarks/page.tsx`
- `src/app/(admin)/learning/bookmarks/new/page.tsx`
- `src/components/shared/markdown-editor.tsx`
- `src/components/admin/notes/note-form.tsx`
- `src/components/admin/notes/note-list.tsx`
- `src/components/admin/notes/note-card.tsx`
- `src/components/admin/notes/note-filters.tsx`
- `src/components/admin/notes/note-detail.tsx`
- `src/components/admin/review/review-queue.tsx`
- `src/components/admin/review/review-card.tsx`
- `src/components/admin/bookmarks/bookmark-form.tsx`
- `src/components/admin/bookmarks/bookmark-list.tsx`
- `src/lib/review/spaced-repetition.ts`
- `src/lib/actions/note-actions.ts`
- `src/lib/actions/review-actions.ts`
- `src/lib/actions/bookmark-actions.ts`

## Implementation Steps

### Step 1: Markdown Editor Component (2h)
1. Create `markdown-editor.tsx` — Client Component
2. Layout: two-pane (50/50), left = `<textarea>`, right = `<ReactMarkdown>` preview
3. Props: `value`, `onChange`, `placeholder`
4. Add toolbar buttons: Bold, Italic, Heading, Code, Link (insert markdown syntax)
5. Support tab key for indentation
6. Responsive: stack vertically on mobile (editor on top, preview below toggle)

### Step 2: Notes CRUD — Server Actions (2h)
1. Create `note-actions.ts` with Server Actions:
   - `createNote(formData)` — insert note + review_schedule + activity_log
   - `updateNote(id, formData)` — update note fields
   - `deleteNote(id)` — delete note (cascades to review_schedule)
   - `getNotes(filters)` — paginated list with search/filter
   - `getNote(id)` — single note with review info
2. All actions: validate auth via Supabase server client, return typed results
3. Use `revalidatePath` after mutations

### Step 3: Note Form (2h)
1. Create `note-form.tsx` — Client Component (used for create + edit)
2. Fields: title (input), topic (select), tags (multi-input), visibility (toggle), content (markdown-editor)
3. Tags input: type to add, backspace to remove, render as badges
4. Form validation: title required, content required
5. Submit calls Server Action, shows loading state

### Step 4: Notes List Page (2h)
1. Create `notes/page.tsx` — Server Component, fetches initial notes
2. Create `note-list.tsx` — Client Component for interactive filtering
3. Create `note-filters.tsx` — search input (debounced), topic dropdown, tag select, date range
4. Create `note-card.tsx` — card showing title, topic badge, tags, date, visibility icon, preview snippet
5. Pagination: "Load more" button (offset-based)
6. Sort: newest first (default), can toggle oldest first

### Step 5: Note Detail + Edit Pages (2h)
1. `notes/[id]/page.tsx` — Server Component, full markdown render
2. Sidebar: topic, tags, visibility, created/updated dates, review status, linked entities (placeholder)
3. Action buttons: Edit, Delete (with confirmation dialog), Toggle visibility
4. `notes/[id]/edit/page.tsx` — loads note data into note-form

### Step 6: Spaced Repetition Logic (1h)
1. Create `spaced-repetition.ts` — pure function module
2. Implement `calculateNextReview()` as specified above
3. Export intervals constant for display purposes
4. Unit-testable (no side effects)

### Step 7: Review Queue Page (3h)
1. Create `review/page.tsx` — Server Component, fetch notes due today
2. Query: join `review_schedule` with `notes` where `next_review <= today`, ordered by `next_review` asc (most overdue first)
3. Create `review-queue.tsx` — Client Component
4. Show count badge: "X notes due for review"
5. Create `review-card.tsx`:
   - Shows full note title + content (rendered markdown)
   - Three buttons at bottom: Remember (green), Fuzzy (yellow), Forgot (red)
   - Current level indicator (e.g., "Level 2/5")
   - After rating: card animates out, next card shown
6. Create `review-actions.ts` — Server Action `submitReview(scheduleId, rating)`
7. Empty state: "All caught up! No reviews due today."

### Step 8: Bookmarks CRUD (2h)
1. Create `bookmark-actions.ts` — Server Actions for CRUD
2. Create `bookmark-form.tsx` — URL, title, description, tags, status dropdown
3. Auto-fill title from URL metadata (optional, can skip for v1)
4. Create `bookmark-list.tsx` — filterable list, group by status
5. Create bookmarks list page + create page
6. Link to note: optional select/search for existing note

### Step 9: Activity Logging (1h)
1. Create `src/lib/actions/activity-actions.ts`
2. Helper function `logActivity(userId, entityType, entityId, action)`
3. Call from note/bookmark/review actions on create/update/delete
4. Actions: 'created', 'updated', 'deleted', 'reviewed'

## Todo List
- [x] Build markdown editor (split-pane textarea + react-markdown)
- [x] Implement note Server Actions (CRUD + filters + search)
- [x] Build note form component (create/edit)
- [x] Build notes list page with filters and search
- [x] Build note detail page with sidebar metadata
- [x] Build note edit page
- [x] Implement spaced repetition calculation logic
- [x] Build review queue page and review card component
- [x] Implement review Server Actions
- [x] Build bookmarks CRUD (form, list, actions)
- [x] Add activity logging to all mutations
- [x] Test full flow: create note → appears in review queue next day → review → level up

## Success Criteria
- Can create/edit/delete notes with markdown content
- Markdown renders correctly in preview and detail views
- Search finds notes by title and content substring
- Filters work: topic, tags, date range, visibility
- New note auto-appears in review queue the next day
- Review rating correctly adjusts level and next_review date
- Bookmarks CRUD fully functional
- Visibility toggle works; public notes queryable without auth (for Phase 05)
- All actions log to activity_log

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| react-markdown rendering XSS | High | Use `rehype-sanitize` plugin to sanitize HTML |
| Full-text search performance on large datasets | Low (single user) | PostgreSQL `ilike` sufficient for v1; add `tsvector` index if needed later |
| Tag input UX complexity | Medium | Keep simple: comma-separated or type+enter; no autocomplete in v1 |

## Security Considerations
- All Server Actions verify `auth.uid()` before DB operations
- Markdown sanitized on render (rehype-sanitize) to prevent XSS
- RLS ensures notes only visible to owner (or public if visibility = 'public')
- No raw SQL — use Supabase client query builder

## Next Steps
- Phase 04 (Cross-Linking & Dashboard) uses notes for dashboard widgets and entity linking
- Phase 05 (Portfolio) reads public notes for the blog page
- Phase 06 (Learning Roadmap) links roadmap nodes to notes
