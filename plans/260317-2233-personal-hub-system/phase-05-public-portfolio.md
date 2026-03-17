# Phase 05 — Public Portfolio

## Context Links
- [Plan Overview](./plan.md)
- [Phase 02 — Learning Lab](./phase-02-learning-lab.md) (dependency — public notes)
- [Phase 03 — Project Workshop](./phase-03-project-workshop.md) (dependency — public projects)
- [User Requirements — Module 6](/home/nimblelancer/personal-hub/personal-hub-plan.md)

## Overview
- **Priority**: P2
- **Status**: Pending
- **Effort**: 1 week
- **Depends on**: Phase 02 + Phase 03
- **Description**: Build the public-facing portfolio — About page, project showcase, blog/TIL from public notes, and static editable Resume page. SSR-optimized for SEO, responsive, minimal design.

## Key Insights
- Portfolio auto-pulls from admin data: notes with `visibility = 'public'` → Blog; projects with `visibility = 'public'` → Showcase
- No auth required for public routes — use Supabase anon client
- SSR + static generation where possible for SEO
- Resume is a static editable page stored in profiles table (not auto-generated from DB)
- Clean, minimal design — content-focused, no clutter
- OG images and meta tags for social sharing

## Requirements

### Functional
- **About Page** (`/`): Bio, skills, social links — data from `profiles` table
- **Projects Page** (`/projects`): Grid of public projects with cards (thumbnail, name, one_liner, tech badges)
- **Project Detail** (`/projects/[id]`): Full project docs rendered as markdown, tech stack, links
- **Blog Page** (`/blog`): List of public notes, newest first, with topic/tag filters
- **Blog Post** (`/blog/[id]`): Full note content rendered as markdown
- **Resume Page** (`/resume`): Static editable content (markdown stored in profiles or separate field)
- **SEO**: Dynamic meta tags, OG images, sitemap.xml, robots.txt
- **Responsive**: Mobile-first design, works on all devices

### Non-Functional
- Pages use Server Components + SSR (no client-side data fetching)
- Static paths generated at build time where possible (`generateStaticParams`)
- Page load < 2s on 3G (minimal JS shipped)
- Accessible (proper headings, alt text, semantic HTML)

## Architecture

### Route Structure
```
src/app/(public)/
├── page.tsx              # About / Landing
├── projects/
│   ├── page.tsx          # Project showcase grid
│   └── [id]/page.tsx     # Project detail
├── blog/
│   ├── page.tsx          # Blog listing
│   └── [id]/page.tsx     # Blog post
├── resume/
│   └── page.tsx          # Resume page
└── layout.tsx            # Public layout (navbar + footer)
```

### Data Fetching Strategy
- All pages are Server Components using Supabase server client
- Queries filter on `visibility = 'public'`
- RLS policies ensure anon users only see public data
- Use `generateMetadata` for dynamic SEO per page
- Consider ISR (Incremental Static Regeneration) with `revalidate: 3600` for project/blog pages

### Component Structure
```
src/components/public/
├── public-navbar.tsx         # Top navigation
├── public-footer.tsx         # Footer with social links
├── about-section.tsx         # Bio + skills display
├── project-showcase-grid.tsx # Project cards grid
├── project-showcase-card.tsx # Individual project card
├── project-detail-view.tsx   # Full project page content
├── blog-post-list.tsx        # Blog listing with filters
├── blog-post-card.tsx        # Blog post preview card
├── blog-post-content.tsx     # Full blog post render
└── resume-content.tsx        # Resume page content
```

## Related Code Files

### Files to Create
- `src/app/(public)/page.tsx`
- `src/app/(public)/projects/page.tsx`
- `src/app/(public)/projects/[id]/page.tsx`
- `src/app/(public)/blog/page.tsx`
- `src/app/(public)/blog/[id]/page.tsx`
- `src/app/(public)/resume/page.tsx`
- `src/app/(public)/layout.tsx` (replace placeholder)
- `src/components/public/public-navbar.tsx`
- `src/components/public/public-footer.tsx`
- `src/components/public/about-section.tsx`
- `src/components/public/project-showcase-grid.tsx`
- `src/components/public/project-showcase-card.tsx`
- `src/components/public/project-detail-view.tsx`
- `src/components/public/blog-post-list.tsx`
- `src/components/public/blog-post-card.tsx`
- `src/components/public/blog-post-content.tsx`
- `src/components/public/resume-content.tsx`
- `src/app/sitemap.ts` — dynamic sitemap
- `src/app/robots.ts` — robots.txt

### Files to Modify
- `src/app/(public)/layout.tsx` — update with navbar + footer
- DB: add `resume_content text` column to `profiles` table (migration)

### Admin Files to Add
- `src/app/(admin)/settings/page.tsx` — edit profile (bio, links, resume content)
- `src/components/admin/settings/profile-form.tsx` — profile edit form
- `src/lib/actions/profile-actions.ts` — profile CRUD

## Implementation Steps

### Step 1: Profile & Resume Setup (1.5h)
1. Add migration: `alter table profiles add column resume_content text default '';`
2. Create `profile-actions.ts`:
   - `getProfile(userId)` — fetch profile
   - `updateProfile(userId, data)` — update bio, contact_json, resume_content, avatar_url
   - `getPublicProfile()` — fetch profile for public pages (no auth needed, single user)
3. Create admin settings page with profile form (bio, display_name, contact JSON, avatar URL, resume content)

### Step 2: Public Layout (1.5h)
1. Create `public-navbar.tsx`:
   - Logo/name on left, nav links on right: Home, Projects, Blog, Resume
   - Mobile: hamburger menu with sheet/drawer
   - Active link highlighting
2. Create `public-footer.tsx`:
   - Social links (GitHub, LinkedIn, etc.) from profile contact_json
   - Copyright line
3. Update `(public)/layout.tsx` to compose navbar + main + footer

### Step 3: About / Landing Page (2h)
1. Create `(public)/page.tsx` — Server Component
2. Fetch public profile data
3. Create `about-section.tsx`:
   - Avatar (or placeholder), display name, bio (rendered markdown)
   - Skills/interests section (from topics/tech_stack aggregated from projects)
   - Social links
   - CTA: "View my projects" / "Read my blog"
4. Optional: show 3 featured public projects + 3 recent blog posts below fold
5. `generateMetadata`: title, description, OG tags

### Step 4: Projects Showcase (2h)
1. Create `(public)/projects/page.tsx`:
   - Query: `projects where visibility = 'public' order by updated_at desc`
   - Include tech_stack, one_liner, thumbnail
2. Create `project-showcase-grid.tsx`:
   - Responsive grid (3 cols desktop, 2 tablet, 1 mobile)
   - Filter by topic/type (optional, URL search params)
3. Create `project-showcase-card.tsx`:
   - Thumbnail (or placeholder gradient), name, one_liner, tech badges, status badge
   - Click → navigate to detail
4. `generateMetadata` for projects page

### Step 5: Project Detail Page (2h)
1. Create `(public)/projects/[id]/page.tsx`:
   - Fetch project + project_docs where visibility = 'public'
   - 404 if not found or not public
2. Create `project-detail-view.tsx`:
   - Header: name, one_liner, status, tech badges
   - Links: GitHub, Demo (if provided)
   - Docs content: rendered markdown (react-markdown)
   - Related blog posts (via entity_links to public notes)
3. `generateMetadata` with project name + one_liner
4. `generateStaticParams` for build-time generation of known public projects

### Step 6: Blog Listing (2h)
1. Create `(public)/blog/page.tsx`:
   - Query: `notes where visibility = 'public' order by created_at desc`
   - Paginated (offset-based, 10 per page)
2. Create `blog-post-list.tsx`:
   - Filter by topic (URL search param)
   - Responsive list layout
3. Create `blog-post-card.tsx`:
   - Title, topic badge, tags, date, content preview (first 200 chars stripped of markdown)
   - Click → navigate to post
4. `generateMetadata` for blog page

### Step 7: Blog Post Page (1.5h)
1. Create `(public)/blog/[id]/page.tsx`:
   - Fetch note where id and visibility = 'public'
   - 404 if not found or not public
2. Create `blog-post-content.tsx`:
   - Full markdown render with react-markdown
   - Code syntax highlighting (add `rehype-highlight` or `react-syntax-highlighter`)
   - Metadata: topic, tags, date
   - "Back to blog" link
3. `generateMetadata` with note title as page title
4. `generateStaticParams` for known public notes

### Step 8: Resume Page (1h)
1. Create `(public)/resume/page.tsx`:
   - Fetch `profiles.resume_content`
   - Render as markdown
2. Create `resume-content.tsx` — styled markdown container
3. Admin edits resume content via settings page (markdown editor)
4. `generateMetadata` for resume page

### Step 9: SEO & Sitemap (1h)
1. Create `src/app/sitemap.ts`:
   ```ts
   export default async function sitemap() {
     const publicProjects = await getPublicProjects()
     const publicNotes = await getPublicNotes()
     return [
       { url: '/', lastModified: new Date() },
       { url: '/projects', lastModified: new Date() },
       { url: '/blog', lastModified: new Date() },
       { url: '/resume', lastModified: new Date() },
       ...publicProjects.map(p => ({ url: `/projects/${p.id}`, lastModified: p.updated_at })),
       ...publicNotes.map(n => ({ url: `/blog/${n.id}`, lastModified: n.updated_at })),
     ]
   }
   ```
2. Create `src/app/robots.ts` — allow all public, disallow `/dashboard`, `/login`
3. Add canonical URLs to all pages
4. Verify OG tags render correctly (use og-image debugger)

### Step 10: Responsive Polish (1h)
1. Test all pages on mobile viewport (375px, 768px, 1024px)
2. Ensure navbar collapses to hamburger on mobile
3. Project grid adapts columns
4. Blog posts readable on mobile
5. Typography: readable font sizes, proper line heights

## Todo List
- [ ] Add resume_content column to profiles (migration)
- [ ] Create profile actions and admin settings page
- [ ] Build public navbar and footer
- [ ] Build About/Landing page with profile data
- [ ] Build projects showcase grid page
- [ ] Build project detail page with docs render
- [ ] Build blog listing page with topic filter
- [ ] Build blog post page with syntax highlighting
- [ ] Build resume page (editable markdown from admin)
- [ ] Add sitemap.ts and robots.ts
- [ ] Add generateMetadata to all public pages
- [ ] Test responsive design on multiple viewports
- [ ] Verify OG tags and social sharing previews

## Success Criteria
- All public pages load without auth
- Projects page shows only `visibility = 'public'` projects
- Blog page shows only `visibility = 'public'` notes
- Markdown renders correctly with code highlighting
- SEO: proper titles, descriptions, OG tags on all pages
- Sitemap includes all public routes
- Mobile-responsive on all pages
- Resume page editable from admin settings
- Page loads fast (minimal client JS)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Public page shows private content | High | RLS policies + explicit visibility filter in queries |
| Slow page loads with many public notes | Low (small dataset) | Pagination; ISR with revalidate if needed |
| OG images not rendering on social platforms | Medium | Test with Facebook debugger, Twitter card validator |
| Markdown XSS on public pages | High | Use rehype-sanitize on all markdown renders |

## Security Considerations
- Public pages use anon Supabase client — no auth tokens exposed
- RLS ensures only public data is queryable by anon role
- Markdown sanitized with rehype-sanitize to prevent XSS
- No admin data leaks to public routes (separate route groups)
- Robots.txt blocks crawling of admin routes
- No PII exposed unless user explicitly adds it to public profile

## Next Steps
- After portfolio is live, iterate on design/content
- Phase 06 (Learning Roadmap) can optionally expose public roadmaps on portfolio
- Content Studio (future) would add content section to portfolio
