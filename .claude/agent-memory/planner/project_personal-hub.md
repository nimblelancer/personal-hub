---
name: personal-hub-project
description: Personal Hub — Next.js + Supabase full-stack productivity system with learning lab, project workshop, dashboard, and public portfolio
type: project
---

Personal Hub is a single-user personal productivity web app.

**Stack**: Next.js 15+ App Router (TS strict), Supabase (Postgres + Auth + Storage + RLS), shadcn/ui + Tailwind, Vercel deploy.

**Key decisions**:
- Markdown editor: split-pane textarea + react-markdown (no Tiptap)
- Learning roadmap: list-based parent/child nesting (no tree viz)
- Review queue: show full note content + self-rate buttons (no flip)
- Resume: static editable page (no auto-gen from DB)
- Content Studio: deferred to future

**Plan location**: `plans/260317-2233-personal-hub-system/`

**Why:** User wants to systematize learning, project management, and build a public portfolio — turning "learn and forget" into accumulated assets.

**How to apply:** All implementation should follow the 6-phase plan. Phases 2+3 can run parallel after Phase 1. RLS on all tables. Code files < 200 lines.
