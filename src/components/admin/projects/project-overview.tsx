// Server Component — project metadata display
import Image from 'next/image'
import { StatusBadge, TypeBadge } from './project-status-badge'
import type { ProjectWithDetails } from '@/types'

interface ProjectOverviewProps {
  project: ProjectWithDetails
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Thumbnail */}
      {project.thumbnail_url && (
        <Image
          src={project.thumbnail_url}
          alt={project.name}
          width={512}
          height={192}
          className="w-full max-w-lg h-48 object-cover rounded-xl ring-1 ring-foreground/10"
        />
      )}

      {/* One-liner */}
      {project.one_liner && (
        <p className="text-muted-foreground">{project.one_liner}</p>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 items-center">
        <StatusBadge status={project.status} />
        <TypeBadge type={project.type} />
        <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          {project.visibility}
        </span>
      </div>

      {/* Links */}
      {(project.github_url || project.demo_url) && (
        <div className="flex flex-wrap gap-3">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              GitHub →
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Live Demo →
            </a>
          )}
        </div>
      )}

      {/* Meta table */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm max-w-sm">
        <dt className="text-muted-foreground">Started</dt>
        <dd>{formatDate(project.started_at)}</dd>
        <dt className="text-muted-foreground">Created</dt>
        <dd>{formatDate(project.created_at)}</dd>
        <dt className="text-muted-foreground">Updated</dt>
        <dd>{formatDate(project.updated_at)}</dd>
      </dl>

      {/* Tech stack */}
      {project.tech_stack.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {project.topics.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {project.topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
