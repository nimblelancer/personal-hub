'use client'
import { ProjectCard } from './project-card'
import { StatusBadge } from './project-status-badge'
import type { Project } from '@/types'
import type { ProjectStatusType } from '@/types/database'

const COLUMNS: ProjectStatusType[] = [
  'idea', 'planning', 'in_progress', 'paused', 'completed', 'archived',
]

const COLUMN_LABELS: Record<ProjectStatusType, string> = {
  idea: 'Idea',
  planning: 'Planning',
  in_progress: 'In Progress',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
}

interface ProjectKanbanProps {
  projects: Project[]
}

export function ProjectKanban({ projects }: ProjectKanbanProps) {
  const grouped = Object.fromEntries(
    COLUMNS.map((status) => [
      status,
      projects.filter((p) => p.status === status),
    ])
  ) as Record<ProjectStatusType, Project[]>

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((status) => {
        const columnProjects = grouped[status]
        return (
          <div
            key={status}
            className="flex flex-col gap-3 min-w-[280px] shrink-0"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-1">
              <StatusBadge status={status} />
              <span className="text-xs text-muted-foreground font-medium">
                {COLUMN_LABELS[status]}
              </span>
              <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                {columnProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {columnProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No projects
                </div>
              ) : (
                columnProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
