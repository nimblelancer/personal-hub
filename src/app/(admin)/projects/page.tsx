import { Suspense } from 'react'
import Link from 'next/link'
import { getProjects } from '@/lib/actions/project-actions'
import { ProjectKanban } from '@/components/admin/projects/project-kanban'
import { ProjectListView } from '@/components/admin/projects/project-list-view'
import { ProjectFilters } from '@/components/admin/projects/project-filters'
import type { ProjectStatusType, ProjectTypeType, VisibilityType } from '@/types/database'

interface PageProps {
  searchParams: Promise<{
    view?: string
    type?: string
    status?: string
    visibility?: string
    search?: string
  }>
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const view = params.view ?? 'kanban'

  const projects = await getProjects({
    type: params.type as ProjectTypeType | undefined,
    status: params.status as ProjectStatusType | undefined,
    visibility: params.visibility as VisibilityType | undefined,
  })

  // Client-side search filter (simple name match)
  const searchQuery = params.search?.toLowerCase()
  const filtered = searchQuery
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery) ||
        (p.one_liner ?? '').toLowerCase().includes(searchQuery)
      )
    : projects

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Projects</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden h-8">
            <Link
              href={`?${new URLSearchParams({ ...params, view: 'kanban' }).toString()}`}
              className={`px-3 h-full flex items-center text-sm transition-colors ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              Board
            </Link>
            <Link
              href={`?${new URLSearchParams({ ...params, view: 'list' }).toString()}`}
              className={`px-3 h-full flex items-center text-sm transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              List
            </Link>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            + New Project
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Suspense>
        <ProjectFilters />
      </Suspense>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <p className="text-sm">No projects found.</p>
          <Link href="/projects/new" className="text-sm text-primary hover:underline">
            Create your first project →
          </Link>
        </div>
      ) : view === 'list' ? (
        <ProjectListView projects={filtered} />
      ) : (
        <ProjectKanban projects={filtered} />
      )}
    </div>
  )
}
