'use client'
import Link from 'next/link'
import { StatusBadge, TypeBadge } from './project-status-badge'
import { updateProjectStatus } from '@/lib/actions/project-actions'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDownIcon } from 'lucide-react'
import type { Project } from '@/types'
import type { ProjectStatusType } from '@/types/database'

const ALL_STATUSES: ProjectStatusType[] = [
  'idea', 'planning', 'in_progress', 'paused', 'completed', 'archived',
]

const STATUS_LABELS: Record<ProjectStatusType, string> = {
  idea: 'Idea', planning: 'Planning', in_progress: 'In Progress',
  paused: 'Paused', completed: 'Completed', archived: 'Archived',
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const visibleStack = project.tech_stack.slice(0, 3)
  const overflow = project.tech_stack.length - 3

  async function handleStatusChange(status: ProjectStatusType) {
    await updateProjectStatus(project.id, status)
  }

  return (
    <Card size="sm" className="hover:ring-foreground/20 transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/projects/${project.id}`}
              className="block hover:underline"
            >
              <CardTitle className="truncate">{project.name}</CardTitle>
            </Link>
            {project.one_liner && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {project.one_liner}
              </p>
            )}
          </div>
          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-0.5 shrink-0 focus:outline-none">
              <StatusBadge status={project.status} />
              <ChevronDownIcon className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ALL_STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={s === project.status ? 'font-medium' : ''}
                >
                  {STATUS_LABELS[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-1.5">
          <TypeBadge type={project.type} />
          {visibleStack.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {tech}
            </span>
          ))}
          {overflow > 0 && (
            <span className="text-xs text-muted-foreground">+{overflow} more</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
