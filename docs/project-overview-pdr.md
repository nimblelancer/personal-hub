# Personal Hub: Project Overview & PDR

## Vision
Personal productivity hub combining learning management, project tracking, and public portfolio in a unified knowledge system.

## Product Requirements

### Core Features
- **Learning Lab**: Manage notes by topic (AI/ML, coding, languages), spaced repetition review schedule, markdown content
- **Project Workshop**: Track software/learning/content projects with milestones, docs, lessons learned, GitHub/demo links
- **Cross-Linking**: Entity relationships (notes ↔ projects ↔ bookmarks ↔ roadmaps) via `entity_links` table
- **Public Portfolio**: Share selected projects & notes publicly via visibility controls
- **Bookmarks**: Save URLs with status tracking (saved/reading/done/noted), optional note linkage

### Admin Routes (Authenticated)
- `/dashboard` — Overview and navigation hub
- `/learning` — Note management, review schedules, roadmaps
- `/projects` — Project CRUD, milestones, lessons learned

### Public Routes (Unauthenticated)
- `/` — Marketing landing page
- `/portfolio` — Public projects & notes (filtered by visibility)

### Authentication
- Supabase Auth (email/password)
- `/login` — Auth entry point
- Session persisted via SSR cookies

## Non-Functional Requirements
- **Database**: 11 tables (profiles, notes, bookmarks, projects, roadmaps, entity_links, activity_log, etc.)
- **Stack**: Next.js 15 App Router, Supabase (auth + database), Vercel deployment
- **UI**: shadcn/ui components + Tailwind CSS 4, light/dark theme via next-themes
- **Type Safety**: TypeScript strict, auto-generated database types
- **Single-User**: App scoped to authenticated user via RLS (Row-Level Security)

## Success Metrics
- Fast load times (<1s LCP)
- 100% TypeScript coverage
- Zero unhandled auth errors
- Responsive mobile design

## Key Architectural Decisions

### Single-User Design
- Scoped to authenticated user via RLS (Row-Level Security)
- No multi-user collaboration (can be added in future phases)
- Simplified permission model (all-or-nothing access)

### Entity Linking Pattern
- Cross-document relationships via `entity_links` table
- Bidirectional query support (what links TO this note, what this note links TO)
- Flexible schema supports future entity types

### Spaced Repetition Algorithm
- SM-2 implementation in `src/lib/review/spaced-repetition.ts`
- Configurable difficulty ratings (1-5)
- Automatic next_review scheduling based on performance
- Supports long-term learning workflows

### Public Portfolio Strategy
- Visibility-based filtering (not RLS-enforced)
- Unauthenticated routes render public entities
- SEO support via sitemap.ts and robots.ts
- Blog system leverages note markdown storage

## Version
v0.2.0 (Phases 01-06 completed: Infrastructure, admin features, cross-linking, dashboard, public portfolio, roadmap)
