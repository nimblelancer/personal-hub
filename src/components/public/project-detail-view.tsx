import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Github, ExternalLink } from 'lucide-react'
import type { Project, ProjectDoc } from '@/types/index'

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  in_progress: 'In Progress',
  paused: 'Paused',
  planning: 'Planning',
  idea: 'Idea',
  archived: 'Archived',
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  in_progress: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  paused: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  planning: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  idea: 'bg-muted text-muted-foreground border-border',
  archived: 'bg-muted text-muted-foreground border-border',
}

type Props = {
  project: Project
  docs: ProjectDoc | null
}

export function ProjectDetailView({ project, docs }: Props) {
  const statusClass = STATUS_COLORS[project.status] ?? STATUS_COLORS.idea

  return (
    <article className="space-y-8">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Projects
      </Link>

      {/* Header */}
      <header className="space-y-4">
        {project.thumbnail_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            <Image
              src={project.thumbnail_url}
              alt={project.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
            <Badge variant="outline" className="text-xs">
              {project.type}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{project.name}</h1>

          {project.one_liner && (
            <p className="text-muted-foreground text-base leading-relaxed">{project.one_liner}</p>
          )}

          {/* Links */}
          <div className="flex items-center gap-3 flex-wrap">
            {project.github_url && (
              <Link
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Link>
            )}
            {project.demo_url && (
              <Link
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
              >
                <ExternalLink className="h-4 w-4" />
                Live Demo
              </Link>
            )}
          </div>

          {/* Tech stack */}
          {project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Docs content */}
      {docs?.content && (
        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {docs.content}
          </ReactMarkdown>
        </div>
      )}
    </article>
  )
}
