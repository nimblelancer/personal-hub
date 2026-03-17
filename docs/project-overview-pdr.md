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

## Version
v0.1.0 (Phase 01 completed: Project setup, DB schema, core auth)
