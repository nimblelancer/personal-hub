# Code Standards

## TypeScript
- **Strict Mode**: `tsconfig.json` enforces `strict: true`
- No `any` types unless unavoidable (document with `@ts-ignore`)
- Import types from `@/types/database` for Supabase schema
- All function signatures must include return types

## File Organization

### Naming
- **kebab-case** for all filenames: `admin-sidebar.tsx`, `create-note-form.tsx`
- **Descriptive names**: Self-documenting without reading content
- Examples: `spaced-repetition-logic.ts`, `bookmark-status-badge.tsx`

### Size Limits
- **Max 200 LOC** per file (split when exceeded)
- Exceptions: Config files, migrations, types
- If nearing limit: Extract utilities, split components

### File Structure
```
src/
├── app/           # Next.js App Router
│   ├── (public)/
│   ├── (auth)/
│   └── (admin)/
├── components/    # React components
│   ├── ui/        # shadcn/ui imports + extensions
│   └── admin/     # Admin-specific components
├── lib/           # Utilities & services
│   ├── supabase/  # Auth, client, server, middleware
│   └── utils.ts   # General helpers (cn, formatting, etc.)
├── types/         # TypeScript interfaces
│   └── database.ts # Auto-generated from Supabase
└── styles/        # Global CSS
```

## React Conventions

### Server Components (Default)
- Use for routes, layouts, data fetching
- Never use React hooks (useState, useEffect, etc.)
- Mark client components explicitly: `'use client'` at top

### Client Components
- Only for interactive features (forms, modals, state)
- Keep minimal, extract logic to server actions
- Example: Form submission calls `serverAction()` then refetch

### shadcn/ui Components
- Use for all primitive UI (Button, Dialog, Input, Tabs, Badge)
- Customize via `className` prop using Tailwind
- Never fork or rewrite shadcn components

## Styling
- **Tailwind CSS 4** (PostCSS integrated)
- **Utility-first**: Avoid custom CSS unless necessary
- **Dark Mode**: Via `next-themes` provider (light/dark)
- **Spacing**: Use standard scale (4px base unit)

## Database & Queries

### Supabase Client Types
- **Server**: `createServerClient()` in middleware, API routes
- **Client**: `createBrowserClient()` in client components
- Auto-generated types from `@/types/database`

### Query Patterns
```typescript
// Server
const supabase = createServerClient()
const { data, error } = await supabase.from('notes').select()

// Client
const supabase = createBrowserClient()
const { data } = await supabase.from('projects').select()
```

### RLS & User Context
- Always include `user_id` in insert/update
- RLS enforces ownership (no explicit filters needed)
- Use `select()` without `where` — RLS filters automatically

## Error Handling
- Try-catch around async operations
- Log errors to console (or error service when added)
- Return user-friendly error messages (no stack traces to UI)
- Validate input before database submission

## Testing (Future)
- Unit tests for utilities and business logic
- Integration tests for API routes
- E2E tests for critical flows (auth, CRUD)
- Target: >80% coverage for core features

## Git & Commits
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Keep commits focused (one feature per commit)
- Reference issues if applicable: `fix: #123 prevent duplicate bookmarks`

## Performance
- Code split via Next.js dynamic imports for heavy components
- Image optimization via `next/image`
- Lazy load routes within Admin section
- Monitor Core Web Vitals (LCP, FID, CLS)

## Security
- Never commit `.env.local` (add to `.gitignore`)
- Sanitize user input before database insert
- RLS policies validate all queries server-side
- CORS headers managed by Supabase (no additional config)
