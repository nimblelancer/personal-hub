---
title: "Personal Hub — Full-Stack Productivity System"
description: "Next.js + Supabase personal hub with learning lab, project workshop, cross-linking, and public portfolio"
status: completed
priority: P1
effort: 6-8 weeks
issue: ~
branch: main
tags: [nextjs, supabase, typescript, personal-project]
created: 2026-03-17
---

# Personal Hub — Implementation Plan

Personal productivity system: private admin dashboard (learning, projects, dashboard) + public portfolio. Single-user, Supabase-backed, deployed on Vercel.

## Tech Stack
- Next.js 15+ App Router, TypeScript strict
- Supabase (PostgreSQL + Auth + Storage + RLS)
- shadcn/ui + Tailwind CSS
- Vercel deployment
- Markdown: textarea + react-markdown split-pane

## Architecture
- Route groups: `(admin)` (auth-protected), `(public)` (no auth)
- Server Components default; Client Components only for interactivity
- RLS on all tables — `auth.uid() = user_id`
- `visibility` flag on notes/projects drives portfolio content
- Entity links table for cross-referencing any entities
- Code files < 200 lines; extract into modules

## Phases

| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | [Project Setup](./phase-01-project-setup.md) | 2-3 days | completed |
| 2 | [Learning Lab](./phase-02-learning-lab.md) | 1.5-2 weeks | completed |
| 3 | [Project Workshop](./phase-03-project-workshop.md) | 1-1.5 weeks | completed |
| 4 | [Cross-Linking & Dashboard](./phase-04-cross-linking-dashboard.md) | 1 week | completed |
| 5 | [Public Portfolio](./phase-05-public-portfolio.md) | 1 week | completed |
| 6 | [Learning Roadmap](./phase-06-learning-roadmap.md) | 3-4 days | completed |
| 7 | [Testing & Polish](./phase-07-testing-polish.md) | 3-4 days | completed |

## Key Dependencies
- Phase 1 must complete before all others
- Phase 2 and 3 can run in parallel after Phase 1
- Phase 4 depends on Phases 2 + 3
- Phase 5 depends on Phases 2 + 3 (reads public entities)
- Phase 6 is standalone bonus after Phase 2

## Design Decisions
1. Markdown editor: split-pane textarea + react-markdown (no Tiptap)
2. Learning Roadmap: list-based parent/child nesting (no tree viz)
3. Review queue: full note content + self-rate buttons (no flip)
4. Resume page: static editable (no auto-gen from DB)
5. Content Studio: deferred to future
