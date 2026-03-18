import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types/index'

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  in_progress: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  paused: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  planning: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  idea: 'bg-muted text-muted-foreground border-border',
  archived: 'bg-muted text-muted-foreground border-border',
}

const GRADIENT_PLACEHOLDERS = [
  'from-blue-500/20 to-purple-500/20',
  'from-green-500/20 to-teal-500/20',
  'from-orange-500/20 to-red-500/20',
  'from-pink-500/20 to-rose-500/20',
  'from-indigo-500/20 to-blue-500/20',
]

function gradientForId(id: string) {
  const idx = id.charCodeAt(0) % GRADIENT_PLACEHOLDERS.length
  return GRADIENT_PLACEHOLDERS[idx]
}

export function ProjectShowcaseCard({ project }: { project: Project }) {
  const statusClass = STATUS_COLORS[project.status] ?? STATUS_COLORS.idea

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientForId(project.id)}`} />
        )}
        {/* Status badge overlay */}
        <span className={`absolute top-2 right-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        {project.one_liner && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {project.one_liner}
          </p>
        )}
        {/* Tech stack badges */}
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs px-1.5 py-0">
                {tech}
              </Badge>
            ))}
            {project.tech_stack.length > 4 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                +{project.tech_stack.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
