# Phase 06 — Learning Roadmap

## Context Links
- [Plan Overview](./plan.md)
- [Phase 02 — Learning Lab](./phase-02-learning-lab.md) (dependency — roadmap links to notes)
- [Phase 04 — Cross-Linking](./phase-04-cross-linking-dashboard.md) (uses entity links)
- [User Requirements — Module 1.3](/home/nimblelancer/personal-hub/personal-hub-plan.md)

## Overview
- **Priority**: P3 — Bonus feature
- **Status**: Completed
- **Effort**: 3-4 days
- **Depends on**: Phase 02
- **Description**: Build the learning roadmap feature — list-based tree with parent/child nesting, status tracking per node, and linking nodes to notes. Multiple roadmaps supported (e.g., AI/ML Roadmap, English Roadmap).

## Key Insights
- Confirmed design: list-based with parent/child nesting (no complex tree visualization)
- Each node = a topic/skill; can be nested one level deep (parent → children)
- Status per node: Not Started → In Progress → Learned → Mastered
- Nodes can link to related notes via entity_links (Phase 04)
- Tables already created in Phase 01 schema: `roadmaps`, `roadmap_nodes`
- Keep it simple: collapsible list with indent, not a graph or timeline

## Requirements

### Functional
- **Roadmaps CRUD**: Create, read, update, delete roadmaps
- **Roadmap Fields**: name, description, topic (enum)
- **Nodes CRUD**: Create, read, update, delete nodes within a roadmap
- **Node Fields**: title, description, status, sort_order, parent_id (nullable)
- **Nesting**: One level of nesting — parent nodes contain child nodes
- **Status Tracking**: Click to cycle status: not_started → in_progress → learned → mastered
- **Reorder**: Move nodes up/down within their group
- **Link to Notes**: Use entity links to connect roadmap nodes to related notes
- **Progress Display**: Show completion percentage per roadmap (nodes at learned/mastered vs total)
- **Roadmap List**: All roadmaps with progress bars

### Non-Functional
- Server Component for roadmap list/detail
- Client Component for node interactions (status toggle, reorder)
- Smooth status transitions (optimistic UI)

## Architecture

### Component Structure
```
src/
├── app/(admin)/learning/roadmap/
│   ├── page.tsx                  # Roadmap list (server)
│   ├── new/page.tsx              # Create roadmap
│   └── [id]/page.tsx             # Roadmap detail with nodes
├── components/admin/roadmap/
│   ├── roadmap-form.tsx          # Create/edit roadmap
│   ├── roadmap-list.tsx          # All roadmaps with progress
│   ├── roadmap-card.tsx          # Roadmap card with progress bar
│   ├── roadmap-node-tree.tsx     # Nested node list (client)
│   ├── roadmap-node-item.tsx     # Single node row
│   └── roadmap-node-form.tsx     # Add/edit node dialog
├── lib/actions/
│   └── roadmap-actions.ts        # Server Actions for roadmaps + nodes
```

### Node Tree Rendering
```
Roadmap: AI/ML Learning Path
├── [■ Mastered] Python Fundamentals          ← parent node
│   ├── [■ Mastered] Data types & structures  ← child node
│   ├── [■ Mastered] OOP in Python
│   └── [◆ Learned] Async programming
├── [● In Progress] Machine Learning Basics
│   ├── [● In Progress] Supervised Learning
│   ├── [○ Not Started] Unsupervised Learning
│   └── [○ Not Started] Model Evaluation
└── [○ Not Started] Deep Learning
    ├── [○ Not Started] Neural Network Basics
    └── [○ Not Started] CNNs & RNNs

Progress: 4/10 nodes completed (40%)
```

## Related Code Files

### Files to Create
- `src/app/(admin)/learning/roadmap/page.tsx`
- `src/app/(admin)/learning/roadmap/new/page.tsx`
- `src/app/(admin)/learning/roadmap/[id]/page.tsx`
- `src/components/admin/roadmap/roadmap-form.tsx`
- `src/components/admin/roadmap/roadmap-list.tsx`
- `src/components/admin/roadmap/roadmap-card.tsx`
- `src/components/admin/roadmap/roadmap-node-tree.tsx`
- `src/components/admin/roadmap/roadmap-node-item.tsx`
- `src/components/admin/roadmap/roadmap-node-form.tsx`
- `src/lib/actions/roadmap-actions.ts`

## Implementation Steps

### Step 1: Roadmap Server Actions (2h)
1. Create `roadmap-actions.ts`:
   - `createRoadmap(data)` — insert roadmap + activity_log
   - `updateRoadmap(id, data)` — update roadmap fields
   - `deleteRoadmap(id)` — delete (cascades nodes)
   - `getRoadmaps(userId)` — list with node counts + progress stats
   - `getRoadmap(id)` — single roadmap with all nodes (nested structure)
   - `createNode(roadmapId, data)` — insert node
   - `updateNode(id, data)` — update node fields
   - `deleteNode(id)` — delete node (children become orphans or get deleted)
   - `updateNodeStatus(id, status)` — dedicated status update for quick toggle
   - `reorderNodes(roadmapId, orderedIds)` — batch update sort_order
2. For `getRoadmap`, build nested structure in-app: fetch all nodes flat, group by parent_id

### Step 2: Roadmap CRUD Pages (1.5h)
1. Create `roadmap/page.tsx` — Server Component, fetch all roadmaps with stats
2. Create `roadmap-list.tsx` — grid of roadmap cards
3. Create `roadmap-card.tsx`:
   - Name, description, topic badge
   - Progress bar (completed nodes / total nodes)
   - Node count
4. Create `roadmap/new/page.tsx` — create form
5. Create `roadmap-form.tsx` — name, description, topic select

### Step 3: Roadmap Detail with Node Tree (3h)
1. Create `roadmap/[id]/page.tsx` — Server Component, fetch roadmap + nodes
2. Create `roadmap-node-tree.tsx` — Client Component:
   - Render parent nodes as expandable/collapsible sections
   - Child nodes indented under parents
   - "Add node" button (top-level or under a parent)
   - Edit/delete actions on each node
3. Create `roadmap-node-item.tsx`:
   - Status icon (colored circle/square by status)
   - Title + optional description
   - Click status icon to cycle: not_started → in_progress → learned → mastered
   - Move up/down buttons
   - Edit button → opens node form dialog
   - Delete button with confirmation
   - Linked notes count badge (clickable to view)
4. Create `roadmap-node-form.tsx` — Dialog:
   - Title, description, parent_id (select from existing parents or "None"), status
   - Create / Update mode

### Step 4: Node-to-Note Linking (1h)
1. Reuse entity-link-button and entity-link-dialog from Phase 04
2. Add "Link Notes" button to each roadmap node item
3. Show linked notes count on node item
4. Expand node → show linked notes as clickable links

### Step 5: Progress Calculation (30 min)
1. Helper function: `calculateProgress(nodes)`:
   - completed = nodes where status in ['learned', 'mastered']
   - total = all nodes
   - return `{ completed, total, percentage }`
2. Used in roadmap cards and roadmap detail header
3. Parent node progress: based on children's status (optional, keep simple)

### Step 6: Activity Logging (30 min)
1. Log roadmap create/update/delete
2. Log node status changes (useful for dashboard "recent activity")

## Todo List
- [x] Implement roadmap Server Actions (CRUD for roadmaps + nodes)
- [x] Build roadmap list page with progress cards
- [x] Build roadmap create/edit form
- [x] Build node tree view with collapsible parents
- [x] Build node item with status toggle and actions
- [x] Build node form dialog (create/edit)
- [x] Implement node reordering (move up/down)
- [x] Integrate entity linking for nodes → notes
- [x] Add progress calculation and display
- [x] Add activity logging
- [x] Test: create roadmap → add parent/child nodes → toggle status → link notes

## Success Criteria
- Can create multiple roadmaps with different topics
- Nodes nest one level (parent → children)
- Status cycling works on click: not_started → in_progress → learned → mastered
- Nodes reorderable within their level
- Progress bar updates correctly when node status changes
- Entity links work: node can link to related notes
- Roadmap list shows all roadmaps with progress
- Delete roadmap cascades to nodes

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Deep nesting request (>2 levels) | Low | Enforce max 1 level of nesting; parent_id must reference a root node |
| Orphaned child nodes when parent deleted | Medium | On parent delete: either cascade children or promote to root level |
| Optimistic UI conflicts on rapid status toggles | Low | Debounce toggles; server is source of truth |

## Security Considerations
- RLS on roadmaps: `auth.uid() = user_id`
- RLS on roadmap_nodes: via roadmap ownership check
- All Server Actions verify auth
- Entity links verified through existing link policies

## Next Steps
- Optionally expose public roadmaps on portfolio (future)
- Roadmap nodes could reference bookmarks in addition to notes (future)
- More advanced visualization (tree/graph) could be a future enhancement
